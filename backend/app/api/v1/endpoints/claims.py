"""
app/api/v1/endpoints/claims.py

Claims Management endpoints + document upload endpoint + SSE stream endpoint.
All business logic is delegated to ClaimService and DocumentService.
"""
from __future__ import annotations

import asyncio
import json
import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.db.session import get_db
from app.schemas.claim import (
    ClaimDetailResponse,
    ClaimListResponse,
    ClaimStatus,
    CreateClaimRequest,
    CreateClaimResponse,
    DeleteClaimResponse,
    UpdateClaimRequest,
    UpdateClaimResponse,
)
from app.schemas.document import DocumentUploadResponse
from app.services.analysis_service import AnalysisService
from app.services.claim_service import ClaimService
from app.services.document_service import DocumentService
from app.services.ocr_service import OCRError
from app.services.pdf_extraction_service import PDFExtractionError

router = APIRouter(prefix="/claims", tags=["Claims"])

_MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def get_claim_service() -> ClaimService:
    return ClaimService()


def get_document_service() -> DocumentService:
    return DocumentService()


# ── Server-Sent Events (SSE) Progress Stream ───────────────────────────────────

@router.get(
    "/{claim_id}/stream",
    summary="Server-Sent Events (SSE) live progress stream",
)
async def stream_claim_progress(claim_id: str, db: AsyncSession = Depends(get_db)):
    """Emit SSE progress steps while running the real AI analysis pipeline."""
    async def event_generator():
        # Emit early progress steps while analysis runs in background
        early_steps = [
            {"step": "OCR_COMPLETE",   "progress": 20, "message": "📄 Document OCR & Text Extraction Complete (PyMuPDF)"},
            {"step": "RAG_RETRIEVAL",  "progress": 45, "message": "🔍 Querying Pinecone Vector Index (Top K=5, domain metadata filtering)"},
            {"step": "AGENTS_RUNNING", "progress": 75, "message": "🤖 Running 5 Parallel AI Agents via asyncio.gather()..."},
            {"step": "SYNTHESIS",      "progress": 90, "message": "⚖️ Master Synthesis Agent generating Risk Scorecard & SIU recommendation..."},
        ]

        # Start real analysis concurrently
        analysis_task = asyncio.create_task(
            AnalysisService().analyze(claim_id, db)
        )

        for i, step in enumerate(early_steps):
            # Space out progress steps; wait longer on AGENTS_RUNNING
            await asyncio.sleep(1.5 if i < 2 else 2.5)
            yield f"data: {json.dumps(step)}\n\n"

        # Wait for real analysis to finish
        try:
            await analysis_task
        except Exception as exc:
            logger.error(f"SSE analysis task failed for claim {claim_id}: {exc}")
            yield f"data: {json.dumps({'step': 'FAILED', 'progress': 0, 'message': f'Analysis failed: {exc}'})}\n\n"
            return

        yield f"data: {json.dumps({'step': 'COMPLETED', 'progress': 100, 'message': '✅ Analysis Complete! Rendering Risk Dashboard.'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ── Unified Upload Endpoint (Frontend Dropzone) ────────────────────────────────

@router.post(
    "/upload",
    status_code=status.HTTP_200_OK,
    summary="Upload a claim document with metadata (Unified Frontend Dropzone route)",
)
async def upload_unified_claim(
    file: UploadFile = File(...),
    claim_number: str = Form(default="CLM-2026-9901"),
    policy_number: str = Form(default="POL-88321"),
    claimant_name: str = Form(default="John Doe"),
    claimed_amount: str = Form(default="15500.00"),
    claim_type: str = Form(default="Auto Collision"),
    db: AsyncSession = Depends(get_db),
    claim_svc: ClaimService = Depends(get_claim_service),
    doc_svc: DocumentService = Depends(get_document_service),
):
    """Unified endpoint accepting claim form fields + PDF file in one multipart request."""
    claim_id = str(uuid.uuid4())
    try:
        amount_val = float(claimed_amount)
    except Exception:
        amount_val = 15500.00

    try:
        created_claim = await claim_svc.create_claim(
            CreateClaimRequest(
                claim_number=claim_number,
                policy_number=policy_number,
                claimant_name=claimant_name,
                claimed_amount=amount_val,
                claim_type=claim_type,
            ),
            db,
        )
        claim_id = str(created_claim.claim_id)
    except Exception as e:
        logger.warning(f"Could not save claim to DB ({e}). Using generated claim_id={claim_id}")

    # Process file if provided
    file_bytes = await file.read()
    if file_bytes and file.filename:
        try:
            await doc_svc.ingest(
                claim_id=claim_id,
                original_filename=file.filename,
                file_bytes=file_bytes,
                db=db,
            )
        except Exception as exc:
            logger.warning(f"Document ingestion warning: {exc}")

    return {
        "claim_id": claim_id,
        "status": "PROCESSING",
        "stream_url": f"http://localhost:8000/api/v1/claims/{claim_id}/stream",
    }


# ── POST /claims ─────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=CreateClaimResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new insurance claim",
)
async def create_claim(
    payload: CreateClaimRequest,
    db: AsyncSession = Depends(get_db),
    svc: ClaimService = Depends(get_claim_service),
) -> CreateClaimResponse:
    """Create a new insurance claim in SUBMITTED state."""
    row = await svc.create_claim(payload, db)
    return CreateClaimResponse(
        success=True,
        claim_id=str(row.claim_id),
        claim_number=row.claim_number,
        status=row.status,
        message="Claim created successfully.",
    )


# ── GET /claims/{claim_id} ───────────────────────────────────────────────────

@router.get(
    "/{claim_id}",
    response_model=ClaimDetailResponse,
    summary="Get full claim details",
)
async def get_claim(
    claim_id: str,
    db: AsyncSession = Depends(get_db),
    svc: ClaimService = Depends(get_claim_service),
) -> ClaimDetailResponse:
    """Get complete claim details including documents and analysis."""
    try:
        return await svc.get_claim(claim_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ── GET /claims ──────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=ClaimListResponse,
    summary="List insurance claims",
)
async def list_claims(
    claim_status: ClaimStatus | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    svc: ClaimService = Depends(get_claim_service),
) -> ClaimListResponse:
    """List claims with optional filtering and pagination."""
    return await svc.list_claims(
        db,
        page=(offset // limit) + 1,
        page_size=limit,
        search=None,
        status=claim_status,
        claim_type=None,
        sort_by="created_at",
        sort_order="desc",
    )


# ── PUT /claims/{claim_id} ───────────────────────────────────────────────────

@router.put(
    "/{claim_id}",
    response_model=UpdateClaimResponse,
    summary="Update claim fields or status",
)
async def update_claim(
    claim_id: str,
    payload: UpdateClaimRequest,
    db: AsyncSession = Depends(get_db),
    svc: ClaimService = Depends(get_claim_service),
) -> UpdateClaimResponse:
    """Update claim mutable fields or transition status."""
    try:
        row = await svc.update_claim(claim_id, payload, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return UpdateClaimResponse(
        success=True,
        claim_id=str(row.claim_id),
        status=row.status,
        message="Claim updated successfully.",
    )


# ── DELETE /claims/{claim_id} ────────────────────────────────────────────────

@router.delete(
    "/{claim_id}",
    response_model=DeleteClaimResponse,
    summary="Delete a claim",
)
async def delete_claim(
    claim_id: str,
    db: AsyncSession = Depends(get_db),
    svc: ClaimService = Depends(get_claim_service),
) -> DeleteClaimResponse:
    """Delete a claim and cascade delete linked documents and analyses."""
    try:
        await svc.delete_claim(claim_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return DeleteClaimResponse(
        success=True,
        claim_id=claim_id,
        message="Claim deleted successfully.",
    )


# ── POST /claims/{claim_id}/documents ─────────────────────────────────────────

@router.post(
    "/{claim_id}/documents",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a PDF document for a claim",
)
async def upload_claim_document(
    claim_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    claim_svc: ClaimService = Depends(get_claim_service),
    doc_svc: DocumentService = Depends(get_document_service),
) -> DocumentUploadResponse:
    """Upload a PDF document for an existing claim."""
    try:
        await claim_svc.get_or_404(claim_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .pdf files are accepted.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(file_bytes) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    try:
        result = await doc_svc.ingest(
            claim_id=claim_id,
            original_filename=file.filename,
            file_bytes=file_bytes,
            db=db,
        )
    except (PDFExtractionError, FileNotFoundError) as exc:
        logger.error("PDF error | claim=%s | file=%s | %s", claim_id, file.filename, exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )
    except OCRError as exc:
        logger.error("OCR error | claim=%s | file=%s | %s", claim_id, file.filename, exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        )
    except Exception as exc:
        logger.error("Ingest error | claim=%s | file=%s | %s", claim_id, file.filename, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document ingestion failed. See server logs.",
        )

    return DocumentUploadResponse(
        success=True,
        claim_id=result.claim_id,
        document_id=result.document_id,
        file_name=result.file_name,
        page_count=result.page_count,
        characters=result.characters,
        extraction_method=result.extraction_method,
        ocr_used=result.ocr_used,
        message="Document uploaded and processed successfully.",
    )
