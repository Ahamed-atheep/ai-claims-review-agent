"""
app/schemas/analyze.py

Schemas for the AI analysis endpoint.
The client sends only claim_id — all claim data is loaded server-side.
"""
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    claim_id: str


class AgentResult(BaseModel):
    flags: list[str] = Field(default_factory=list)
    score: int | None = None
    status: str | None = None
    confidence: float | None = None


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
