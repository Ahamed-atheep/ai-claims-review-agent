# Medical & Repair Cost Agent

## AI Adversarial Claims Review System

---

## 1. Overview

The Medical & Repair Cost Agent is one of the five specialized AI agents in the AI Adversarial Claims Review System. Its primary responsibility is to validate medical bills, repair estimates, and labor rates submitted as part of an insurance claim, detecting cost inflation and timeline inconsistencies.

The agent uses Retrieval-Augmented Generation (RAG) to retrieve medical and repair cost benchmarks from Pinecone and combines it with Groq Llama 3.3 70B reasoning to produce explainable cost assessments.

---

## 2. Problem Statement

Insurance claims frequently contain inflated repair estimates and medical bills. Manual cost validation is slow and requires domain expertise.

Common cost fraud scenarios include:

- Labor rates exceeding regional benchmarks
- Inflated repair part costs
- Medical bills inconsistent with injury severity
- Timeline discrepancies between treatment and incident
- Duplicate billing for the same procedure
- Unnecessary medical procedures

---

## 3. Objective

- Validate repair estimates against regional benchmarks
- Detect inflated labor rates and part costs
- Identify medical billing anomalies
- Flag timeline inconsistencies
- Calculate a medical/repair risk score (0–100)
- Generate explainable cost findings

---

## 4. Responsibilities

- Analyze repair estimates and medical bills
- Retrieve cost benchmark knowledge using RAG
- Compare billed rates against regional standards
- Detect timeline discrepancies
- Generate evidence-backed cost findings
- Calculate risk score
- Flag suspicious billing behavior

---

## 5. Agent Architecture

```
Claim PDF
     │
     ▼
OCR (PyMuPDF)
     │
Extracted Claim Text
     │
     ▼
Gemini Embedding Model
     │
3072-dimensional Vector
     │
     ▼
Pinecone Vector Database
(Filter = medical)
     │
Top-K Medical/Repair Knowledge
     │
     ▼
Groq Llama 3.3 70B
     │
Cost Reasoning
     │
     ▼
JSON Response
```

---

## 6. Input

```json
{
  "claim_id": "CLM-2026-9901",
  "claim_type": "Auto Collision",
  "claim_amount": 15500,
  "policy_number": "POL-88321",
  "extracted_text": "Body shop labor rate $125/hr. Regional benchmark $85/hr..."
}
```

---

## 7. Knowledge Base

Knowledge sources retrieved from Pinecone (domain = `medical`):

- Regional labor rate benchmarks
- Standard repair cost guidelines
- Medical billing code references
- Injury-to-treatment timeline standards
- Known billing anomaly patterns

---

## 8. Processing Workflow

1. Receive extracted claim text
2. Generate embeddings using Gemini
3. Search Pinecone with `domain=medical` filter
4. Retrieve top-5 relevant cost benchmark chunks
5. Inject context into prompt
6. Send prompt to Groq Llama 3.3 70B
7. Analyze costs and timelines
8. Apply heuristic fallback (labor rate check)
9. Return structured JSON

---

## 9. RAG Pipeline

```
Claim Text
     │
Gemini Embedding
     │
Pinecone Similarity Search (domain=medical)
     │
Cost Benchmark Knowledge
     │
Prompt Construction
     │
Groq LLM
     │
Cost Analysis
```

---

## 10. LLM Reasoning

The agent uses **Groq Llama 3.3 70B Versatile** to evaluate:

- Labor rate vs. regional benchmark
- Part cost inflation
- Medical bill vs. injury severity
- Treatment timeline consistency
- Duplicate billing indicators

---

## 11. Output

```json
{
  "score": 65,
  "risk_level": "MEDIUM",
  "flags": [
    "Labor rate exceeds regional benchmark",
    "Timeline discrepancy"
  ],
  "reasoning": "Billed labor rate of $125/hr exceeds regional benchmark of $85/hr.",
  "evidence": [
    "Body shop labor rate ($125/hr) exceeds regional benchmark ($85/hr)."
  ]
}
```

---

## 12. Technology Stack

| Component | Technology |
|---|---|
| Programming Language | Python |
| Backend | FastAPI |
| Embeddings | Gemini Embedding 001 |
| LLM | Groq Llama 3.3 70B |
| Vector Database | Pinecone |
| OCR | PyMuPDF |
| Knowledge Retrieval | RAG |

---

## 13. Heuristic Fallback

If the LLM fails or returns empty output, the agent applies a keyword-based fallback:

- Detects `$125`, `labor rate`, or `inflated` in claim text
- Appends `"Labor rate exceeds regional benchmark"` to flags
- Sets minimum score of 60
- Provides default reasoning and evidence

---

## 14. Advantages

- Validates costs against real benchmark data
- Explainable findings with evidence
- Heuristic fallback ensures output even on LLM failure
- Runs in parallel with other agents
- Consistent evaluation across all claims

---

## 15. Limitations

- Benchmark data must be kept current in Pinecone
- Cannot access live repair shop pricing APIs
- Depends on OCR quality for cost extraction
- Regional benchmarks may vary by geography

---

## 16. Future Enhancements

- Integration with live repair cost APIs
- Computer vision for vehicle damage assessment
- Medical billing code (CPT) validation
- Geographic benchmark adjustment
- Adaptive cost model learning

---

## 17. Sample Scenario

**Input:**

- Claim Amount: $15,500
- Labor rate billed: $125/hr
- Regional benchmark: $85/hr

**Agent Output:**

- Risk Score: 65
- Risk Level: MEDIUM
- Flag: Labor rate exceeds regional benchmark
- Evidence: Body shop labor rate ($125/hr) exceeds regional benchmark ($85/hr)

---

## 18. Sequence Diagram

```
User
 │
 │ Upload Claim
 ▼
Backend
 │
OCR Extraction
 │
 ▼
Medical Agent
 │
Gemini Embedding
 │
 ▼
Pinecone (domain=medical)
 │
Cost Benchmark Knowledge
 │
 ▼
Groq LLM
 │
Cost Analysis
 │
 ▼
JSON Response
 │
 ▼
Master Orchestrator
```

---

## 19. Conclusion

The Medical & Repair Cost Agent provides automated, evidence-backed validation of repair and medical costs in insurance claims. By combining domain-specific RAG retrieval with LLM reasoning, it detects cost inflation and timeline anomalies that would otherwise require manual expert review, significantly reducing investigation time and improving claim accuracy.
