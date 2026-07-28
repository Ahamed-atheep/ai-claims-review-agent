from pydantic import BaseModel, Field
from typing import List, Optional

class FraudAgentOutput(BaseModel):
    score: int = Field(default=0, ge=0, le=100)
    flags: List[str] = Field(default_factory=list)

class MedicalAgentOutput(BaseModel):
    score: int = Field(default=0, ge=0, le=100)
    flags: List[str] = Field(default_factory=list)

class PolicyAgentOutput(BaseModel):
    status: str = Field(default="COMPLIANT")  # e.g. COMPLIANT, NON_COMPLIANT, APPROVED_WITH_CONDITIONS
    violations: List[str] = Field(default_factory=list)

class EvidenceAgentOutput(BaseModel):
    consistency_score: int = Field(default=100, ge=0, le=100)
    missing_evidence: List[str] = Field(default_factory=list)
    conflicts: List[str] = Field(default_factory=list)

class HistoricalAgentOutput(BaseModel):
    similarity_score: int = Field(default=0, ge=0, le=100)
    matched_patterns: List[str] = Field(default_factory=list)
