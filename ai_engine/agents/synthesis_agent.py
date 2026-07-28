from ai_engine.agents.state import ClaimState

def run_synthesis_agent(state: ClaimState) -> ClaimState:
    fraud = state.get("fraud_analysis", {})
    medical = state.get("medical_analysis", {})
    compliance = state.get("compliance_analysis", {})

    fraud_score = fraud.get("score", 0)
    medical_score = medical.get("score", 0)

    overall_risk = int((fraud_score * 0.6) + (medical_score * 0.4))

    if overall_risk >= 75:
        risk_level = "HIGH"
        recommendation = "REFER TO SPECIAL INVESTIGATION UNIT (SIU)"
    elif overall_risk >= 45:
        risk_level = "MEDIUM"
        recommendation = "MANUAL AUDIT REQUIRED BY CLAIMS ADJUSTER"
    else:
        risk_level = "LOW"
        recommendation = "APPROVE CLAIM FOR PAYMENT"

    evidence = []
    evidence.extend(fraud.get("flags", []))
    evidence.extend(medical.get("flags", []))
    if compliance.get("violations"):
        evidence.extend(compliance.get("violations"))

    questions = [
        "Can the claimant provide verified tow truck receipts and timestamped photos?",
        "Why does the repair estimate contain labor rates higher than standard regional benchmarks?",
        "Has a formal police report been verified with local law enforcement?"
    ]

    state["overall_risk_score"] = overall_risk
    state["risk_level"] = risk_level
    state["fraud_score"] = fraud_score
    state["key_evidence"] = evidence
    state["investigator_questions"] = questions
    state["final_recommendation"] = recommendation
    return state
