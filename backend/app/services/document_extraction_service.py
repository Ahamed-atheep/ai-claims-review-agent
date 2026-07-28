import time
from dataclasses import dataclass
from typing import Literal
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.models import ClaimDocument
from app.services.ocr_service import OCRError, OCRService
from app.services.pdf_extraction_service import (
    OCR_FALLBACK_THRESHOLD,
    PDFExtractionError,
    PDFExtractionService,
)


@dataclass
class ExtractionResult:
    document_id: str
    page_count: int
    method: Literal["pymupdf", "easyocr"]
    characters: int
    ocr_used: bool
    success: bool
    text: str  # raw extracted text, used by DocumentService to persist


class DocumentExtractionService:
    """Runs PDF text extraction with automatic OCR fallback.

    Deliberately has no database dependency — callers decide what to
    persist and when, keeping transactions in one place.
    """

    def __init__(self) -> None:
        self._pdf = PDFExtractionService()
        self._ocr: OCRService | None = None  # lazy-init — EasyOCR is heavy

    def _get_ocr(self) -> OCRService:
        if self._ocr is None:
            self._ocr = OCRService()
        return self._ocr

    @staticmethod
    def _uuid(value: str | UUID) -> UUID:
        return value if isinstance(value, UUID) else UUID(str(value))

    def run(self, file_path: str, document_id: str = "") -> ExtractionResult:
        """Extract text from *file_path*, falling back to OCR when needed.

        Args:
            file_path: Absolute or relative path to the stored PDF.
            document_id: Optional identifier used only for log messages.

        Returns:
            ExtractionResult containing text, page count, method, and stats.

        Raises:
            FileNotFoundError: PDF file does not exist at the given path.
            PDFExtractionError: PDF is corrupted, encrypted, or unreadable.
            OCRError: EasyOCR failed to process one or more pages.
        """
        start = time.perf_counter()

        text, page_count = self._pdf.extract_text(file_path)
        method: Literal["pymupdf", "easyocr"] = "pymupdf"
        ocr_used = False

        if len(text) < OCR_FALLBACK_THRESHOLD:
            logger.info(
                "doc=%s | PyMuPDF chars=%d below threshold=%d — switching to EasyOCR",
                document_id, len(text), OCR_FALLBACK_THRESHOLD,
            )
            page_images = self._pdf.render_pages_as_png(file_path)
            text = self._get_ocr().extract_text_from_images(page_images)
            method = "easyocr"
            ocr_used = True

        elapsed_ms = int((time.perf_counter() - start) * 1000)
        logger.info(
            "Extraction complete | doc=%s | pages=%d | method=%s | chars=%d | elapsed_ms=%d",
            document_id, page_count, method, len(text), elapsed_ms,
        )

        return ExtractionResult(
            document_id=document_id,
            page_count=page_count,
            method=method,
            characters=len(text),
            ocr_used=ocr_used,
            success=True,
            text=text,
        )

    async def retry(self, document_id: str, db: AsyncSession) -> ExtractionResult:
        """Re-run extraction on an existing document row (retry endpoint).

        Loads storage_path from claim_documents, calls run(), then overwrites
        raw_ocr_text and page_count in the database.

        Raises:
            ValueError: Document not found.
            PDFExtractionError / OCRError: Extraction failed.
            RuntimeError: Database update failed.
        """
        result = await db.execute(
            select(ClaimDocument).where(ClaimDocument.document_id == self._uuid(document_id))
        )
        doc_row: ClaimDocument | None = result.scalar_one_or_none()
        if doc_row is None:
            raise ValueError(f"Document '{document_id}' not found.")

        extraction = self.run(doc_row.storage_path, document_id=document_id)

        try:
            await db.execute(
                update(ClaimDocument)
                .where(ClaimDocument.document_id == self._uuid(document_id))
                .values(raw_ocr_text=extraction.text, page_count=extraction.page_count)
            )
            await db.commit()
        except Exception as exc:
            await db.rollback()
            raise RuntimeError(f"DB update failed for document '{document_id}': {exc}") from exc

        return extraction
