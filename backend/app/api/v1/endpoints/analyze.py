from fastapi import APIRouter

from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.mock_ai import MockAIService

router = APIRouter()
_mock_ai = MockAIService()


@router.post("/analyze", response_model=AnalyzeResponse, tags=["Analyze"])
async def analyze_claim(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Submit a claim for AI risk analysis. Currently backed by MockAIService."""
    return _mock_ai.analyze(payload)
