"""
app/services/mock_ai.py

Temporary stand-in for the LangGraph AI Engine (Member 1).
Returns a static response matching the agreed API contract.
Replace with a real HTTP call to ai_engine once Member 1 delivers.
"""
from app.schemas.analyze import AgentAnalysis, AgentResult, AnalyzeResponse


class MockAIService:
    """Stateless mock that returns a fixed high-risk analysis result."""

    def analyze(
        self,
        *,
        claim_id: str,
        policy_number: str,
        claimant_name: str,
        claim_amount: float,
        claim_type: str,
        extracted_text: str,
    ) -> AnalyzeResponse:
        return AnalyzeResponse(
            claim_id=claim_id,
            overall_risk_score=78,
            risk_level="HIGH",
            fraud_score=82,
            agent_analysis=AgentAnalysis(
                fraud_agent=AgentResult(
                    flags=["Duplicate invoice"], score=82, confidence=0.91
                ),
                medical_agent=AgentResult(
                    flags=["Timeline discrepancy"], score=60, confidence=0.82
                ),
                compliance_agent=AgentResult(
                    status="APPROVED_WITH_CONDITIONS", confidence=0.88
                ),
            ),
            key_evidence=["Repair estimate timestamp precedes incident date by 2 days."],
            investigator_questions=["Can claimant provide verified tow receipts?"],
            final_recommendation="REFER TO SPECIAL INVESTIGATION UNIT (SIU)",
        )
