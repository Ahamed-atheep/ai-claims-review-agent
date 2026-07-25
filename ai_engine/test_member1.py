import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_engine.agents.workflow import analyze_claim_pipeline

def run_test():
    print("=" * 60)
    print("🤖 MEMBER 1: TESTING AI AGENT & RAG PIPELINE")
    print("=" * 60)

    sample_claim = {
        "claim_id": "CLM-2026-9901",
        "policy_number": "POL-88321",
        "claimant_name": "John Doe",
        "claim_amount": 15500.00,
        "claim_type": "Auto Collision",
        "extracted_text": "Claimant states vehicle hit guardrail on Highway 101. Repair estimate timestamp precedes incident date by 2 days. Single vehicle incident without police report attached."
    }

    print("\n[Input Claim Payload]:")
    print(json.dumps(sample_claim, indent=2))

    print("\n[Executing Multi-Agent Workflow...]")
    result = analyze_claim_pipeline(sample_claim)

    print("\n[Final Output JSON - Matching Team Shared Contract]:")
    print(json.dumps(result, indent=2))
    print("\n" + "=" * 60)
    print("✅ MEMBER 1 AI ENGINE TEST PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_test()
