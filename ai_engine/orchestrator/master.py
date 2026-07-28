from typing import Dict, Any
from ai_engine.orchestrator.parallel_runner import ParallelRunner
from ai_engine.orchestrator.synthesis import MasterSynthesisAgent
from ai_engine.models.request_model import ClaimAnalysisRequest
from ai_engine.models.response_model import ClaimAnalysisResponse
from ai_engine.utils.logger import logger

class MasterOrchestrator:
    """
    Master Orchestrator class managing the end-to-end multi-agent execution pipeline.
    
    1. Accepts Claim JSON
    2. Executes 5 specialized AI agents asynchronously in parallel
    3. Synthesizes outputs into agreed API contract response
    """

    def __init__(self):
        self.parallel_runner = ParallelRunner()
        self.synthesis_agent = MasterSynthesisAgent()

    async def analyze_claim(self, request: ClaimAnalysisRequest) -> ClaimAnalysisResponse:
        claim_data = request.model_dump()
        logger.info(f"MasterOrchestrator received claim analysis request for '{request.claim_id}'")

        # Step 1: Run 5 AI agents in parallel asynchronously
        agent_outputs = await self.parallel_runner.run_all(claim_data)

        # Step 2: Synthesize findings into exact contract schema
        final_response = await self.synthesis_agent.synthesize(claim_data, agent_outputs)

        return final_response
