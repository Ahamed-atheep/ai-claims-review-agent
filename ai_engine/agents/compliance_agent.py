from ai_engine.agents.state import ClaimState

def run_compliance_agent(state: ClaimState) -> ClaimState:
    amount = state.get("claim_amount", 0)
    violations = []
    status = "COMPLIANT"

    if amount > 50000:
        violations.append(f"Claim amount (${amount:,.2f}) exceeds policy limit of $50,000 per incident")
        status = "NON_COMPLIANT"

    state["compliance_analysis"] = {
        "status": status,
        "violations": violations,
        "deductible": "$500 Standard Collision Deductible Applies"
    }
    return state
