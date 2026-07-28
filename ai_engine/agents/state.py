from typing import TypedDict, List, Dict, Any

class ClaimState(TypedDict):
    claim_id: str
    policy_number: str
    claimant_name: str
    claim_amount: float
    claim_type: str
    extracted_text: str
    rag_context: str
    fraud_analysis: Dict[str, Any]
    medical_analysis: Dict[str, Any]
    compliance_analysis: Dict[str, Any]
    overall_risk_score: int
    risk_level: str
    fraud_score: int
    key_evidence: List[str]
    investigator_questions: List[str]
    final_recommendation: str
