import asyncio
import json
from ai_engine.models.request_model import ClaimAnalysisRequest
from ai_engine.orchestrator.master import MasterOrchestrator
from ai_engine.utils.logger import logger

async def run_member1_test():
    logger.info("========== TESTING MEMBER 1 (AI ENGINE) ==========")
    
    orchestrator = MasterOrchestrator()
    
    test_request = ClaimAnalysisRequest(
        claim_id="CLM-2026-9901",
        policy_number="POL-88321",
        claimant_name="John Doe",
        claim_amount=15500.00,
        claim_type="Auto Collision",
        extracted_text="Claimant states vehicle hit guardrail on Highway 101. Repair estimate timestamp precedes incident date by 2 days. Body shop labor rate billed at $125 per hour."
    )
    
    logger.info("Executing 5-Agent Parallel RAG Analysis...")
    response = await orchestrator.analyze_claim(test_request)
    
    print("\n=================== FINAL JSON RESPONSE (API CONTRACT) ===================")
    print(json.dumps(response.model_dump(), indent=2))
    print("==========================================================================\n")
    logger.info("SUCCESS: Member 1 AI Engine executed flawlessly!")

if __name__ == "__main__":
    asyncio.run(run_member1_test())
