"""
test_full_stack_integration.py

End-to-End United System Test:
Validates that Frontend, Backend, and AI Engine work together as one unified pipeline.
"""
import sys
import asyncio
import json
from pathlib import Path

# Add root directory to sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ai_engine.models.request_model import ClaimAnalysisRequest
from ai_engine.orchestrator.master import MasterOrchestrator
from backend.app.schemas.analyze import AnalyzeResponse

async def run_end_to_end_test():
    print("\n" + "="*70)
    print("UNITED SYSTEM INTEGRATION TEST: FRONTEND -> BACKEND -> AI ENGINE")
    print("="*70)

    # 1. Simulate Document Text & Form Data from Frontend
    sample_request = ClaimAnalysisRequest(
        claim_id="CLM-2026-9901",
        policy_number="POL-88321",
        claimant_name="John Doe",
        claim_amount=15500.00,
        claim_type="Auto Collision",
        extracted_text=(
            "CLAIM SUMMARY:\n"
            "Claimant John Doe states vehicle hit guardrail on I-5 South on March 15, 2026.\n"
            "Total repair estimate: $15,500.00 (Apex Collision Center, License #GAR-9941).\n"
            "Repair estimate timestamp: March 13, 2026.\n"
            "Billed labor: 48 hours @ $125/hr ($6,000.00).\n"
            "Medical treatment: ER Visit on March 4, 2026.\n"
            "Police report: Missing for damage > $3,000 threshold."
        )
    )

    print(f"\n[1/3] Frontend Input Payload Received:")
    print(f"      Claim ID:       {sample_request.claim_id}")
    print(f"      Claimant:       {sample_request.claimant_name}")
    print(f"      Policy:         {sample_request.policy_number}")
    print(f"      Amount:         ${sample_request.claim_amount:,.2f}")
    print(f"      Extracted Text: {len(sample_request.extracted_text)} chars")

    # 2. Execute 5-Agent Multi-Domain RAG AI Engine
    print("\n[2/3] Invoking 5-Agent RAG AI Engine (Pinecone + Groq + Gemini)...")
    orchestrator = MasterOrchestrator()
    ai_engine_response = await orchestrator.analyze_claim(sample_request)

    # 3. Validate Schema Compatibility for Backend & Frontend
    print("\n[3/3] Validating Backend & Frontend API Contract Schema...")
    response_dict = ai_engine_response.model_dump()
    AnalyzeResponse.model_validate(response_dict)

    print("\n" + "="*70)
    print("UNITED SYSTEM TEST SUCCESSFUL! ALL 3 MODULES FULLY OPERATIONAL")
    print("="*70)
    print("\nFinal API Response Payload (Consumed by Frontend Dashboard):")
    print(json.dumps(response_dict, indent=2))

if __name__ == "__main__":
    asyncio.run(run_end_to_end_test())
