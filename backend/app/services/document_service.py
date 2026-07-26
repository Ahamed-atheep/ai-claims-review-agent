import uuid
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.models import ClaimDocument
from app.services.document_extraction_service import DocumentExtractionService, ExtractionResult
from app.services.storage_service import StorageService


@dataclass
class DocumentIngestResult:
    document_id: str
    claim_id: str
    file_name: str
    storage_path: str
    page_count: int
    characters: int
    extraction_method: str
    ocr_used: bool


class DocumentService:
    """Owns the full document ingestion transaction.

    Sequence:
        1. Save file to disk via StorageService.
        2. INSERT claim_documents row (without text yet).
        3. Run extraction via DocumentExtractionService.run().
        4. UPDATE claim_documents with raw_ocr_text + page_count.
        5. COMMIT — or ROLLBACK + delete file on any failure.
    """

    def __init__(self) -> None:
        self._storage = StorageService()
        self._extractor = DocumentExtractionService()

    async def ingest(
        self,
        claim_id: str,
        original_filename: str,
        file_bytes: bytes,
        db: AsyncSession,
    ) -> DocumentIngestResult:
        """Store, record, and extract text for an uploaded PDF.

        Args:
            claim_id: UUID of the parent claim (already validated by caller).
            original_filename: Original filename from the upload.
            file_bytes: Raw PDF bytes.
            db: Active async session — this method owns the transaction.

        Returns:
            DocumentIngestResult with all fields needed for the API response.

        Raises:
            StorageError: File could not be written to disk.
            PDFExtractionError: PDF is corrupted or unreadable.
            OCRError: EasyOCR failed.
            RuntimeError: Database operation failed.
        """
        # ── 1. Persist file to disk ───────────────────────────────────────────
        _, stored_path = self._storage.save(original_filename, file_bytes)
        document_id = str(uuid.uuid4())

        try:
            # ── 2. INSERT skeleton row ────────────────────────────────────────
            doc_row = ClaimDocument(
                document_id=document_id,
                claim_id=claim_id,
                file_name=original_filename,
                storage_path=stored_path,
                mime_type="application/pdf",
            )
            db.add(doc_row)
            await db.flush()  # write row, stay inside transaction

            # ── 3. Extract text (CPU-bound, outside transaction lock) ─────────
            extraction: ExtractionResult = self._extractor.run(
                stored_path, document_id=document_id
            )

            # ── 4. UPDATE row with extraction results ─────────────────────────
            doc_row.raw_ocr_text = extraction.text
            doc_row.page_count = extraction.page_count
            await db.flush()

            # ── 5. COMMIT ─────────────────────────────────────────────────────
            await db.commit()

        except Exception as exc:
            await db.rollback()
            # Best-effort cleanup of the orphaned file
            try:
                import os
                os.remove(stored_path)
            except OSError:
                pass
            logger.error(
                "Document ingest failed | claim=%s | file=%s | error=%s",
                claim_id, original_filename, exc,
            )
            raise

        logger.info(
            "Document ingested | claim=%s | doc=%s | file=%s | pages=%d | method=%s | chars=%d",
            claim_id, document_id, original_filename,
            extraction.page_count, extraction.method, extraction.characters,
        )

        return DocumentIngestResult(
            document_id=document_id,
            claim_id=claim_id,
            file_name=original_filename,
            storage_path=stored_path,
            page_count=extraction.page_count,
            characters=extraction.characters,
            extraction_method=extraction.method,
            ocr_used=extraction.ocr_used,
        )
