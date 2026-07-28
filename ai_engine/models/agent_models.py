from pydantic import BaseModel, Field
from typing import List

class FraudAgentOutput(BaseModel):
    score: int = Field(default=0, ge=0, le=100)
    flags: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")
    evidence: List[str] = Field(default_factory=list)

class MedicalAgentOutput(BaseModel):
    score: int = Field(default=0, ge=0, le=100)
    flags: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")
    evidence: List[str] = Field(default_factory=list)

class PolicyAgentOutput(BaseModel):
    status: str = Field(default="COMPLIANT")
    violations: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")

class EvidenceAgentOutput(BaseModel):
    consistency_score: int = Field(default=100, ge=0, le=100)
    missing_evidence: List[str] = Field(default_factory=list)
    conflicts: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")

class HistoricalAgentOutput(BaseModel):
    similarity_score: int = Field(default=0, ge=0, le=100)
    matched_patterns: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")
