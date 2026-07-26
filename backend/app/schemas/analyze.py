from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    claim_id: str
    policy_number: str
    claimant_name: str
    claim_amount: float
    claim_type: str
    extracted_text: str


class AgentResult(BaseModel):
    flags: list[str] = []
    score: int | None = None
    status: str | None = None


class AgentAnalysis(BaseModel):
    fraud_agent: AgentResult
    medical_agent: AgentResult
    compliance_agent: AgentResult


class AnalyzeResponse(BaseModel):
    claim_id: str
    overall_risk_score: int
    risk_level: str
    fraud_score: int
    agent_analysis: AgentAnalysis
    key_evidence: list[str]
    investigator_questions: list[str]
    final_recommendation: str
