from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AgentAnalysisSection(BaseModel):
    fraud_agent: Dict[str, Any] = Field(..., example={"flags": ["Duplicate invoice"], "score": 82})
    medical_agent: Dict[str, Any] = Field(..., example={"flags": ["Timeline discrepancy"], "score": 60})
    compliance_agent: Dict[str, Any] = Field(..., example={"status": "APPROVED_WITH_CONDITIONS"})

class ClaimAnalysisResponse(BaseModel):
    """Response payload matching exact team contract schema."""
    claim_id: str = Field(..., example="CLM-2026-9901")
    overall_risk_score: int = Field(..., example=78)
    risk_level: str = Field(..., example="HIGH")
    fraud_score: int = Field(..., example=82)
    agent_analysis: AgentAnalysisSection
    key_evidence: List[str] = Field(..., example=["Repair estimate timestamp precedes incident date by 2 days."])
    investigator_questions: List[str] = Field(..., example=["Can claimant provide verified tow receipts?"])
    final_recommendation: str = Field(..., example="REFER TO SPECIAL INVESTIGATION UNIT (SIU)")

    class Config:
        json_schema_extra = {
            "example": {
                "claim_id": "CLM-2026-9901",
                "overall_risk_score": 78,
                "risk_level": "HIGH",
                "fraud_score": 82,
                "agent_analysis": {
                    "fraud_agent": {
                        "flags": ["Duplicate invoice"],
                        "score": 82
                    },
                    "medical_agent": {
                        "flags": ["Timeline discrepancy"],
                        "score": 60
                    },
                    "compliance_agent": {
                        "status": "APPROVED_WITH_CONDITIONS"
                    }
                },
                "key_evidence": [
                    "Repair estimate timestamp precedes incident date by 2 days."
                ],
                "investigator_questions": [
                    "Can claimant provide verified tow receipts?"
                ],
                "final_recommendation": "REFER TO SPECIAL INVESTIGATION UNIT (SIU)"
            }
        }
