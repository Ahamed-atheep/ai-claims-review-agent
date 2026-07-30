# Master Synthesis Agent

## AI Adversarial Claims Review System

---

## 1. Overview

The Master Synthesis Agent is the orchestrating agent in the AI Adversarial Claims Review System. It receives the outputs from all five specialized agents — Fraud, Medical, Policy, Evidence, and Historical — and synthesizes them into a single, unified risk report that matches the API contract.

Unlike the five specialized agents, the Master Synthesis Agent does not perform RAG retrieval. It reasons purely over the structured outputs of the other agents using Groq Llama 3.3 70B to produce a final, explainable decision.

---

## 2. Problem Statement

Five specialized agents each produce independent findings. Without a synthesis layer, these outputs are fragmented and cannot be presented as a unified decision to insurance investigators.

Challenges include:

- Aggregating conflicting risk scores from multiple agents
- Producing a single overall risk level
- Generating a coherent final recommendation
- Extracting the most critical evidence across all agents
- Formulating targeted investigator questions
- Formatting output to match the API contract exactly

---

## 3. Objective

- Aggregate all five agent outputs
- Calculate a unified overall risk score
- Determine final risk level (LOW / MEDIUM / HIGH / CRITICAL)
- Generate a final recommendation (APPROVE / REJECT / ESCALATE / REQUEST EVIDENCE)
- Extract key evidence from all agents
- Generate targeted investigator questions
- Return a response matching the exact API contract schema

---

## 4. Responsibilities

- Receive outputs from all 5 specialized agents
- Reason over aggregated findings using LLM
- Calculate weighted overall risk score
- Determine final risk level
- Generate final recommendation
- Extract top key evidence items
- Formulate investigator questions
- Return structured API contract response

---

## 5. Agent Architecture

```
Fraud Agent Output
Medical Agent Output
Policy Agent Output       ──▶  Master Synthesis Agent
Evidence Agent Output
Historical Agent Output
                                      │
                               Groq Llama 3.3 70B
                                      │
                               Final Risk Report
                                      │
                               API Contract Response
```

---

## 6. Input

The Master Synthesis Agent receives the combined outputs of all 5 agents:

```json
{
  "claim_id": "CLM-2026-9901",
  "claim_amount": 15500,
  "fraud_output": {
    "score": 82,
    "flags": ["Duplicate Invoice", "Timeline Anomaly"]
  },
  "medical_output": {
    "score": 65,
    "flags": ["Labor rate exceeds regional benchmark"]
  },
  "policy_output": {
    "status": "APPROVED_WITH_CONDITIONS",
    "violations": ["Missing police report"]
  },
  "evidence_output": {
    "consistency_score": 45,
    "missing_evidence": ["Police report"],
    "conflicts": ["Repair estimate dated before accident"]
  },
  "historical_output": {
    "similarity_score": 72,
    "matched_patterns": ["Isolated road staged collision pattern"]
  }
}
```

---

## 7. Processing Workflow

1. Receive all 5 agent outputs from ParallelRunner
2. Format all outputs into synthesis prompt
3. Send prompt to Groq Llama 3.3 70B
4. Parse LLM JSON response
5. Apply fallback score calculation if LLM fails
6. Determine risk level from overall score
7. Extract key evidence and investigator questions
8. Return ClaimAnalysisResponse matching API contract

---

## 8. Synthesis Pipeline

```
5 Agent Outputs
     │
Prompt Construction
     │
Groq LLM (temperature=0.1)
     │
JSON Parse
     │
Fallback Score Calculation (if needed)
     │
Risk Level Determination
     │
API Contract Response
```

---

## 9. LLM Reasoning

The agent uses **Groq Llama 3.3 70B Versatile** (temperature=0.1 for consistency) to:

- Weigh findings from all 5 agents
- Identify the most critical risk factors
- Calculate a unified overall risk score
- Determine the appropriate final recommendation
- Extract the top key evidence items
- Generate targeted investigator questions

---

## 10. Risk Score Calculation

If the LLM returns a valid score, it is used directly. Otherwise, a weighted fallback is applied:

```
overall_risk_score = (fraud_score × 0.6) + (medical_score × 0.4)
```

Risk level thresholds:

| Score Range | Risk Level |
|---|---|
| 75 – 100 | HIGH |
| 45 – 74 | MEDIUM |
| 0 – 44 | LOW |

---

## 11. Output

Exact API contract response:

```json
{
  "claim_id": "CLM-2026-9901",
  "overall_risk_score": 78,
  "risk_level": "HIGH",
  "fraud_score": 82,
  "agent_analysis": {
    "fraud_agent": {
      "flags": ["Duplicate Invoice", "Timeline Anomaly"],
      "score": 82
    },
    "medical_agent": {
      "flags": ["Labor rate exceeds regional benchmark"],
      "score": 65
    },
    "compliance_agent": {
      "status": "APPROVED_WITH_CONDITIONS"
    }
  },
  "key_evidence": [
    "Repair estimate timestamp precedes incident date by 2 days.",
    "Labor rate ($125/hr) exceeds regional benchmark ($85/hr)."
  ],
  "investigator_questions": [
    "Can claimant provide verified tow receipts?",
    "Why does the repair estimate predate the reported incident?"
  ],
  "final_recommendation": "REFER TO SPECIAL INVESTIGATION UNIT (SIU)"
}
```

---

## 12. Recommendation Mapping

| LLM Output | DB Enum Value | Display Value |
|---|---|---|
| `APPROVE` | `APPROVE` | `APPROVE` |
| `REJECT` | `REJECT` | `REJECT` |
| `ESCALATE_TO_INVESTIGATOR` | `ESCALATE_TO_INVESTIGATOR` | `REFER TO SPECIAL INVESTIGATION UNIT (SIU)` |
| `REQUEST ADDITIONAL EVIDENCE` | `REQUEST_ADDITIONAL_EVIDENCE` | `REQUEST ADDITIONAL EVIDENCE` |

---

## 13. Technology Stack

| Component | Technology |
|---|---|
| Programming Language | Python |
| Backend | FastAPI |
| LLM | Groq Llama 3.3 70B (temperature=0.1) |
| Orchestration | asyncio (parallel_runner.py) |
| Output Schema | Pydantic ClaimAnalysisResponse |
| Database | PostgreSQL (Supabase) |

---

## 14. Advantages

- Single unified decision from 5 independent agents
- Low temperature (0.1) ensures consistent, deterministic output
- Fallback score calculation prevents null outputs
- Exact API contract compliance
- Explainable key evidence and investigator questions
- Supports all 4 recommendation types

---

## 15. Limitations

- Quality of synthesis depends on quality of 5 agent outputs
- If all 5 agents fail (rate limit), synthesis works on fallback data only
- LLM reasoning is not fully deterministic even at low temperature
- Cannot access external data sources directly

---

## 16. Future Enhancements

- Confidence scoring per agent output
- Weighted agent importance by claim type
- Multi-LLM consensus synthesis
- Automated SIU case file generation
- Real-time synthesis streaming to frontend

---

## 17. Sample Scenario

**Input from 5 Agents:**

- Fraud Score: 82 (HIGH) — Duplicate invoice, timeline anomaly
- Medical Score: 65 (MEDIUM) — Labor rate inflated
- Policy Status: APPROVED_WITH_CONDITIONS — Missing police report
- Evidence Consistency: 45 — Repair estimate before accident
- Historical Similarity: 72 — Matches staged collision pattern

**Master Synthesis Output:**

- Overall Risk Score: 78
- Risk Level: HIGH
- Final Recommendation: REFER TO SPECIAL INVESTIGATION UNIT (SIU)
- Key Evidence: Repair estimate precedes incident date by 2 days
- Investigator Question: Can claimant provide verified tow receipts?

---

## 18. Sequence Diagram

```
ParallelRunner
 │
 │ All 5 Agent Outputs
 ▼
Master Synthesis Agent
 │
Prompt Construction
 │
 ▼
Groq LLM (temperature=0.1)
 │
JSON Parse + Fallback
 │
 ▼
ClaimAnalysisResponse
 │
 ▼
Backend API
 │
 ▼
Frontend Dashboard
```

---

## 19. Conclusion

The Master Synthesis Agent is the decision-making core of the AI Adversarial Claims Review System. By aggregating findings from five specialized agents and reasoning over them with a low-temperature LLM call, it produces a consistent, explainable, and actionable risk report that directly supports insurance investigators and SIU teams in making informed claim decisions.
