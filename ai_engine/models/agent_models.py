from pydantic import BaseModel, Field, field_validator
from typing import List

class FraudAgentOutput(BaseModel):
    score: int = Field(default=0, ge=0, le=100)
    flags: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")
    evidence: List[str] = Field(default_factory=list)

    @field_validator("score", mode="before")
    @classmethod
    def clamp_score(cls, v: int) -> int:
        if isinstance(v, (int, float)):
            return max(0, min(100, int(v)))
        return 0

class MedicalAgentOutput(BaseModel):
    score: int = Field(default=0, ge=0, le=100)
    flags: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")
    evidence: List[str] = Field(default_factory=list)

    @field_validator("score", mode="before")
    @classmethod
    def clamp_score(cls, v: int) -> int:
        if isinstance(v, (int, float)):
            return max(0, min(100, int(v)))
        return 0

class PolicyAgentOutput(BaseModel):
    status: str = Field(default="COMPLIANT")
    violations: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")

class EvidenceAgentOutput(BaseModel):
    consistency_score: int = Field(default=100, ge=0, le=100)
    missing_evidence: List[str] = Field(default_factory=list)
    conflicts: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")

    @field_validator("consistency_score", mode="before")
    @classmethod
    def clamp_score(cls, v: int) -> int:
        if isinstance(v, (int, float)):
            return max(0, min(100, int(v)))
        return 100

class HistoricalAgentOutput(BaseModel):
    similarity_score: int = Field(default=0, ge=0, le=100)
    matched_patterns: List[str] = Field(default_factory=list)
    reasoning: str = Field(default="")

    @field_validator("similarity_score", mode="before")
    @classmethod
    def clamp_score(cls, v: int) -> int:
        if isinstance(v, (int, float)):
            return max(0, min(100, int(v)))
        return 0
