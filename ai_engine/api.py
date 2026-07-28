from fastapi import APIRouter, HTTPException, status
from ai_engine.models.request_model import ClaimAnalysisRequest
from ai_engine.models.response_model import ClaimAnalysisResponse
from ai_engine.orchestrator.master import MasterOrchestrator
from ai_engine.utils.logger import logger

router = APIRouter(prefix="/api/v1", tags=["AI Engine Claims Analysis"])
orchestrator = MasterOrchestrator()

@router.post("/analyze", response_model=ClaimAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_claim(request: ClaimAnalysisRequest):
    """
    Analyzes an insurance claim using the Adversarial Multi-Agent AI Architecture.
    
    Exposes ONLY the agreed team API response contract schema.
    """
    try:
        logger.info(f"API Endpoint /api/v1/analyze received request for claim '{request.claim_id}'")
        result = await orchestrator.analyze_claim(request)
        return result
    except Exception as e:
        logger.error(f"Error processing claim analysis in API endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Engine claim analysis failed: {str(e)}"
        )
