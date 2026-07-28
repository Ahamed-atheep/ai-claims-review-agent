"""
app/api/v1/endpoints/analyze.py

AI Analysis endpoint.
Accepts claim_id or full claim payload for AI analysis.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.db.session import get_db
from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.analysis_service import AnalysisService

router = APIRouter()


def get_analysis_service() -> AnalysisService:
    return AnalysisService()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    tags=["Analyze"],
)
async def analyze_claim(
    payload: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    svc: AnalysisService = Depends(get_analysis_service),
) -> AnalyzeResponse:
    """Run AI risk analysis on a claim."""
    try:
        return await svc.analyze(payload, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except RuntimeError as exc:
        logger.error(
            "Analysis persistence failed | claim_id=%s | %s", payload.claim_id, exc
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        )
    except Exception as exc:
        logger.error("Analysis failed | claim_id=%s | %s", payload.claim_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {exc}",
        )


@router.post(
    "/analyze/{claim_id}",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    tags=["Analyze"],
)
async def analyze_claim_by_path(
    claim_id: str,
    db: AsyncSession = Depends(get_db),
    svc: AnalysisService = Depends(get_analysis_service),
) -> AnalyzeResponse:
    """Run AI risk analysis on an existing claim by path parameter."""
    try:
        return await svc.analyze(claim_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except RuntimeError as exc:
        logger.error("Analysis persistence failed | claim_id=%s | %s", claim_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        )
    except Exception as exc:
        logger.error("Analysis failed | claim_id=%s | %s", claim_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {exc}",
        )


@router.get(
    "/analyze/{claim_id}",
    response_model=AnalyzeResponse,
    status_code=status.HTTP_200_OK,
    tags=["Analyze"],
)
async def get_latest_analysis(
    claim_id: str,
    db: AsyncSession = Depends(get_db),
    svc: AnalysisService = Depends(get_analysis_service),
) -> AnalyzeResponse:
    """Return the latest persisted analysis for an existing claim."""
    try:
        return await svc.get_latest(claim_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.error("Analysis retrieval failed | claim_id=%s | %s", claim_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analysis. See server logs.",
        )
