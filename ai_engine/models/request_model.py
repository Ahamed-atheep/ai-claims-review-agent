from pydantic import BaseModel, Field
from typing import Optional

class ClaimAnalysisRequest(BaseModel):
    """Incoming request payload for claim analysis matching team contract."""
    claim_id: str = Field(..., example="CLM-2026-9901")
    policy_number: str = Field(..., example="POL-88321")
    claimant_name: str = Field(..., example="John Doe")
    claim_amount: float = Field(..., example=15500.00)
    claim_type: str = Field(..., example="Auto Collision")
    extracted_text: str = Field(..., example="Claimant states vehicle hit guardrail on Highway 101...")

    class Config:
        json_schema_extra = {
            "example": {
                "claim_id": "CLM-2026-9901",
                "policy_number": "POL-88321",
                "claimant_name": "John Doe",
                "claim_amount": 15500.00,
                "claim_type": "Auto Collision",
                "extracted_text": "Claimant states vehicle hit guardrail on Highway 101. Repair estimate timestamp precedes incident date by 2 days."
            }
        }
