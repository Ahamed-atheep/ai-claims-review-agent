import asyncio
import pytest
from ai_engine.models.request_model import ClaimAnalysisRequest
from ai_engine.orchestrator.master import MasterOrchestrator

@pytest.mark.asyncio
async def test_claim_analysis():
    """Test MasterOrchestrator with sample payload matching exact contract schema."""
    orchestrator = MasterOrchestrator()
    
    sample_request = ClaimAnalysisRequest(
        claim_id="CLM-2026-9901",
        policy_number="POL-88321",
        claimant_name="John Doe",
        claim_amount=15500.00,
        claim_type="Auto Collision",
        extracted_text="Claimant states vehicle hit guardrail on Highway 101. Repair estimate timestamp precedes incident date by 2 days. Labor rate billed at $125 per hour."
    )

    response = await orchestrator.analyze_claim(sample_request)

    # Assert response fields match API contract
    assert response.claim_id == "CLM-2026-9901"
    assert isinstance(response.overall_risk_score, int)
    assert response.risk_level in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert isinstance(response.fraud_score, int)
    assert "fraud_agent" in response.agent_analysis.model_dump()
    assert "medical_agent" in response.agent_analysis.model_dump()
    assert "compliance_agent" in response.agent_analysis.model_dump()
    assert isinstance(response.key_evidence, list)
    assert isinstance(response.investigator_questions, list)
    assert isinstance(response.final_recommendation, str)

if __name__ == "__main__":
    asyncio.run(test_claim_analysis())
    print("ALL TESTS PASSED PERFECTLY!")
