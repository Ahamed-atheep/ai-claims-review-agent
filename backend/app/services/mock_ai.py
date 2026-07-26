from app.schemas.analyze import AgentAnalysis, AgentResult, AnalyzeRequest, AnalyzeResponse


class MockAIService:
    """
    Temporary stand-in for the LangGraph AI Engine (Member 1).
    Returns a static response that matches the agreed API contract.
    Replace with real HTTP call to ai_engine once it is ready.
    """

    def analyze(self, request: AnalyzeRequest) -> AnalyzeResponse:
        return AnalyzeResponse(
            claim_id=request.claim_id,
            overall_risk_score=78,
            risk_level="HIGH",
            fraud_score=82,
            agent_analysis=AgentAnalysis(
                fraud_agent=AgentResult(flags=["Duplicate invoice"], score=82),
                medical_agent=AgentResult(flags=["Timeline discrepancy"], score=60),
                compliance_agent=AgentResult(status="APPROVED_WITH_CONDITIONS"),
            ),
            key_evidence=["Repair estimate timestamp precedes incident date by 2 days."],
            investigator_questions=["Can claimant provide verified tow receipts?"],
            final_recommendation="REFER TO SPECIAL INVESTIGATION UNIT (SIU)",
        )
