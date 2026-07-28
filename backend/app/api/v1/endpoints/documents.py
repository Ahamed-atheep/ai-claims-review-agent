from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.session import get_db
from app.schemas.extraction import ExtractionResponse
from app.services.document_extraction_service import DocumentExtractionService
from app.services.ocr_service import OCRError
from app.services.pdf_extraction_service import PDFExtractionError

router = APIRouter()


def get_extraction_service() -> DocumentExtractionService:
    return DocumentExtractionService()


@router.post(
    "/documents/{document_id}/extract",
    response_model=ExtractionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Documents"],
)
async def retry_document_extraction(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    service: DocumentExtractionService = Depends(get_extraction_service),
) -> ExtractionResponse:
    """Re-run text extraction on an already-uploaded document.

    Reloads the stored PDF, re-extracts text (PyMuPDF → EasyOCR fallback),
    and overwrites raw_ocr_text and page_count in claim_documents.
    Does NOT accept a new file upload.
    """
    try:
        result = await service.retry(document_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except PDFExtractionError as exc:
        logger.error("PDF extraction error | doc=%s | %s", document_id, exc)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except OCRError as exc:
        logger.error("OCR error | doc=%s | %s", document_id, exc)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except RuntimeError as exc:
        logger.error("DB error | doc=%s | %s", document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        )

    return ExtractionResponse(
        document_id=result.document_id,
        page_count=result.page_count,
        method=result.method,
        characters=result.characters,
        ocr_used=result.ocr_used,
        success=result.success,
    )
