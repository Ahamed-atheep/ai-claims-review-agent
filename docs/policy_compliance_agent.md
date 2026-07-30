# Policy Compliance Agent

## AI Adversarial Claims Review System

---

## 1. Overview

The Policy Compliance Agent is one of the five specialized AI agents in the AI Adversarial Claims Review System. Its primary responsibility is to verify that an insurance claim complies with the terms, conditions, coverage limits, and exclusions defined in the policy document.

The agent uses Retrieval-Augmented Generation (RAG) to retrieve policy knowledge from Pinecone and combines it with Groq Llama 3.3 70B reasoning to produce explainable compliance assessments.

---

## 2. Problem Statement

Insurance policies contain complex terms, coverage limits, and exclusions that are difficult to manually cross-check for every claim. Non-compliant claims that slip through result in financial losses and legal exposure.

Common compliance issues include:

- Claims exceeding coverage limits
- Claims for excluded events or items
- Missing mandatory documentation
- Policy lapse at time of incident
- Deductible not applied correctly
- Claim type not covered under policy

---

## 3. Objective

- Verify claim against policy coverage limits
- Detect policy exclusion violations
- Check mandatory documentation requirements
- Identify deductible application issues
- Generate compliance status and violation list
- Provide explainable policy reasoning

---

## 4. Responsibilities

- Analyze claim against policy terms
- Retrieve policy knowledge using RAG
- Check coverage limits and exclusions
- Detect missing mandatory documents
- Generate compliance status
- List specific policy violations
- Provide reasoning for each violation

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
(Filter = policy)
     │
Top-K Policy Knowledge
     │
     ▼
Groq Llama 3.3 70B
     │
Compliance Reasoning
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
  "extracted_text": "Claimant states vehicle hit a guardrail..."
}
```

---

## 7. Knowledge Base

Knowledge sources retrieved from Pinecone (domain = `policy`):

- Policy coverage terms and conditions
- Coverage limit schedules
- Exclusion clauses
- Mandatory documentation requirements
- Deductible rules
- Claim filing deadlines

---

## 8. Processing Workflow

1. Receive extracted claim text
2. Generate embeddings using Gemini
3. Search Pinecone with `domain=policy` filter
4. Retrieve top-5 relevant policy knowledge chunks
5. Inject context into prompt
6. Send prompt to Groq Llama 3.3 70B
7. Evaluate compliance
8. Return structured JSON with status and violations

---

## 9. RAG Pipeline

```
Claim Text
     │
Gemini Embedding
     │
Pinecone Similarity Search (domain=policy)
     │
Policy Knowledge
     │
Prompt Construction
     │
Groq LLM
     │
Compliance Analysis
```

---

## 10. LLM Reasoning

The agent uses **Groq Llama 3.3 70B Versatile** to evaluate:

- Whether claim amount is within coverage limits
- Whether the incident type is covered
- Whether mandatory documents are present
- Whether any exclusion clauses apply
- Whether deductible has been correctly applied

---

## 11. Output

```json
{
  "status": "APPROVED_WITH_CONDITIONS",
  "violations": [
    "Missing police report for damage exceeding $3,000"
  ],
  "reasoning": "Policy terms checked against $50,000 maximum collision limit and $500 deductible. Claim amount within limits but mandatory police report is absent."
}
```

Possible status values:

| Status | Meaning |
|---|---|
| `COMPLIANT` | Claim fully meets policy requirements |
| `APPROVED_WITH_CONDITIONS` | Compliant but missing some documentation |
| `NON_COMPLIANT` | Claim violates one or more policy terms |
| `EXCLUDED` | Claim falls under a policy exclusion |

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

## 13. Advantages

- Consistent policy enforcement across all claims
- Explainable violation reasoning
- Reduces manual policy review effort
- Runs in parallel with other agents
- Evidence-backed compliance decisions

---

## 14. Limitations

- Policy knowledge base must be kept current
- Cannot access live policy management systems
- Complex multi-policy scenarios may require human review
- Depends on OCR quality for claim text extraction

---

## 15. Future Enhancements

- Direct integration with policy management systems
- Multi-policy cross-reference support
- Real-time policy update ingestion
- Jurisdiction-specific compliance rules
- Automated deductible calculation

---

## 16. Sample Scenario

**Input:**

- Claim Type: Auto Collision
- Claim Amount: $15,500
- Policy Maximum: $50,000
- Deductible: $500
- Police report: Not provided

**Agent Output:**

- Status: APPROVED_WITH_CONDITIONS
- Violation: Missing police report for damage exceeding $3,000
- Reasoning: Claim amount within policy limits but mandatory police report absent

---

## 17. Sequence Diagram

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
Policy Agent
 │
Gemini Embedding
 │
 ▼
Pinecone (domain=policy)
 │
Policy Knowledge
 │
 ▼
Groq LLM
 │
Compliance Analysis
 │
 ▼
JSON Response
 │
 ▼
Master Orchestrator
```

---

## 18. Conclusion

The Policy Compliance Agent automates the complex task of verifying insurance claims against policy terms and conditions. By combining domain-specific RAG retrieval with LLM reasoning, it ensures consistent, explainable, and evidence-backed compliance decisions, reducing the risk of approving non-compliant claims and minimizing manual policy review effort.
