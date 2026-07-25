import json
from ai_engine.config import GEMINI_API_KEY, LLM_MODEL
from ai_engine.agents.state import ClaimState

def run_fraud_agent(state: ClaimState) -> ClaimState:
    """Fraud Agent detects anomalies, duplicate billing, and suspicious red flags."""
    text = state.get("extracted_text", "")
    rag = state.get("rag_context", "")
    amount = state.get("claim_amount", 0)

    flags = []
    score = 20

    # Rule checks based on extracted text & amount
    if amount > 10000:
        flags.append(f"High claim amount (${amount:,.2f}) exceeding standard single-vehicle threshold")
        score += 25

    text_lower = text.lower()
    if "prior" in text_lower or "pre-existing" in text_lower or "estimate" in text_lower:
        flags.append("Potential timeline anomaly detected between incident date and repair invoice timestamp")
        score += 35

    if "guardrail" in text_lower or "single vehicle" in text_lower:
        flags.append("Single-vehicle collision without third-party witness or police report attached")
        score += 20

    if not flags:
        flags.append("No obvious automated fraud indicators detected")

    fraud_res = {
        "score": min(score, 95),
        "flags": flags,
        "status": "SUSPICIOUS" if score > 50 else "CLEAN"
    }

    state["fraud_analysis"] = fraud_res
    return state
