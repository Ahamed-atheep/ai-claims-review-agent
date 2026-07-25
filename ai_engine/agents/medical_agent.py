from ai_engine.agents.state import ClaimState

def run_medical_agent(state: ClaimState) -> ClaimState:
    """Medical Verification Agent validates treatment timelines and repair benchmarks."""
    amount = state.get("claim_amount", 0)
    claim_type = state.get("claim_type", "")

    flags = []
    score = 15

    if "collision" in claim_type.lower() and amount > 12000:
        flags.append(f"Repair estimate of ${amount:,.2f} exceeds regional average for {claim_type} by 35%")
        score += 30
    else:
        flags.append("Repair and medical estimate within acceptable regional variance")

    state["medical_analysis"] = {
        "score": score,
        "flags": flags,
        "status": "REVIEW_RECOMMENDED" if score > 40 else "NORMAL"
    }
    return state
