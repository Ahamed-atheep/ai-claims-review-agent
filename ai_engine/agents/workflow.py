from ai_engine.rag.retriever import KnowledgeRetriever
from ai_engine.agents.state import ClaimState
from ai_engine.agents.fraud_agent import run_fraud_agent
from ai_engine.agents.medical_agent import run_medical_agent
from ai_engine.agents.compliance_agent import run_compliance_agent
from ai_engine.agents.synthesis_agent import run_synthesis_agent

def analyze_claim_pipeline(claim_data: dict) -> dict:
    retriever = KnowledgeRetriever()
    extracted_text = claim_data.get("extracted_text", "")
    query = f"{claim_data.get('claim_type', '')} {extracted_text}"
    rag_context = retriever.retrieve(query)

    state: ClaimState = {
        "claim_id": claim_data.get("claim_id", "CLM-UNKNOWN"),
        "policy_number": claim_data.get("policy_number", "POL-UNKNOWN"),
        "claimant_name": claim_data.get("claimant_name", "Unknown Claimant"),
        "claim_amount": float(claim_data.get("claim_amount", 0.0)),
        "claim_type": claim_data.get("claim_type", "Collision"),
        "extracted_text": extracted_text,
        "rag_context": rag_context,
        "fraud_analysis": {},
        "medical_analysis": {},
        "compliance_analysis": {},
        "overall_risk_score": 0,
        "risk_level": "LOW",
        "fraud_score": 0,
        "key_evidence": [],
        "investigator_questions": [],
        "final_recommendation": ""
    }

    state = run_fraud_agent(state)
    state = run_medical_agent(state)
    state = run_compliance_agent(state)
    state = run_synthesis_agent(state)

    return {
        "claim_id": state["claim_id"],
        "overall_risk_score": state["overall_risk_score"],
        "risk_level": state["risk_level"],
        "fraud_score": state["fraud_score"],
        "agent_analysis": {
            "fraud_agent": state["fraud_analysis"],
            "medical_agent": state["medical_analysis"],
            "compliance_agent": state["compliance_analysis"]
        },
        "key_evidence": state["key_evidence"],
        "investigator_questions": state["investigator_questions"],
        "final_recommendation": state["final_recommendation"]
    }
