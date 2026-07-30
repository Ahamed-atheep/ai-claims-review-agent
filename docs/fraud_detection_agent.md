# Fraud Detection Agent

## AI Adversarial Claims Review System

---

## 1. Overview

The Fraud Detection Agent is one of the five specialized AI agents in the AI Adversarial Claims Review System. Its primary responsibility is to analyze insurance claims and identify potential fraud indicators before the claim proceeds to manual investigation or approval.

The agent uses Retrieval-Augmented Generation (RAG) to retrieve insurance fraud knowledge from Pinecone and combines it with Large Language Model (LLM) reasoning using Groq Llama 3.3 70B to produce explainable fraud assessments.

---

## 2. Problem Statement

Insurance companies process thousands of claims every day. Manual fraud detection is time-consuming, inconsistent, and prone to missing subtle fraud patterns.

Common fraud scenarios include:

- Duplicate repair invoices
- Inflated repair estimates
- Manipulated timestamps
- Phantom vehicle repairs
- Repeated fraud patterns
- Suspicious billing behavior

The Fraud Detection Agent automates this analysis and provides investigators with explainable evidence.

---

## 3. Objective

The primary objectives of the Fraud Detection Agent are:

- Detect suspicious insurance claims
- Identify fraud indicators
- Calculate fraud risk score
- Generate explainable findings
- Reduce manual investigation effort
- Assist Special Investigation Unit (SIU)

---

## 4. Responsibilities

The Fraud Detection Agent performs the following tasks:

- Analyze claim information
- Retrieve fraud knowledge using RAG
- Compare claim details with fraud rules
- Detect inconsistencies
- Generate evidence-backed findings
- Calculate fraud score (0–100)
- Recommend further investigation if required

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
(Filter = Fraud)
     │
Top-K Fraud Knowledge
     │
     ▼
Groq Llama 3.3 70B
     │
Fraud Reasoning
     │
     ▼
JSON Response
```

---

## 6. Input

The Fraud Detection Agent receives:

```json
{
  "claim_id": "CLM-2026-9901",
  "claim_type": "Auto Collision",
  "claim_amount": 15500,
  "policy_number": "POL-88321",
  "claim_text": "Repair estimate created before accident date..."
}
```

---

## 7. Knowledge Base

The agent retrieves information from the Fraud domain inside Pinecone.

Knowledge sources include:

- `fraud_rules_catalog.txt`
- `insurance_fraud_indicators_master.txt`

These documents contain:

- Fraud indicators
- Known fraud patterns
- Billing anomalies
- Timeline inconsistencies
- Duplicate invoice rules

---

## 8. Processing Workflow

The complete workflow is:

1. Receive extracted claim text
2. Generate embeddings using Gemini
3. Search Pinecone for fraud knowledge
4. Retrieve top relevant fraud chunks
5. Inject context into prompt
6. Send prompt to Groq Llama
7. Analyze claim
8. Calculate fraud score
9. Return structured JSON

---

## 9. RAG Pipeline

The Fraud Detection Agent follows a Retrieval-Augmented Generation workflow.

```
Claim Text
     │
Embedding
     │
Similarity Search
     │
Fraud Knowledge
     │
Prompt Construction
     │
Groq LLM
     │
Fraud Analysis
```

Instead of relying only on pretrained knowledge, the LLM reasons using verified insurance fraud documents retrieved from Pinecone.

---

## 10. LLM Reasoning

The agent uses:

- **Groq Llama 3.3 70B Versatile**

The LLM evaluates:

- Timeline anomalies
- Invoice duplication
- Cost inflation
- Missing evidence
- Fraud likelihood

It produces explainable reasoning rather than simple classifications.

---

## 11. Output

Example output:

```json
{
  "agent": "FraudAgent",
  "risk_score": 82,
  "risk_level": "HIGH",
  "flags": [
    "Duplicate Invoice",
    "Timeline Anomaly"
  ],
  "recommendation": "Refer to SIU"
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

## 13. Advantages

- Fast fraud detection
- Explainable AI decisions
- Evidence-backed reasoning
- Reduced manual effort
- Consistent claim evaluation
- Parallel execution with other agents

---

## 14. Limitations

- Depends on quality of OCR
- Requires updated fraud knowledge base
- Cannot replace human investigators
- Performance depends on retrieved context quality

---

## 15. Future Enhancements

Future improvements include:

- Graph-based fraud detection
- Cross-insurance fraud analysis
- Real-time fraud alerts
- Image-based fraud verification
- Vehicle damage assessment using Computer Vision
- Adaptive fraud learning

---

## 16. Sample Scenario

**Input:**

- Claim Amount: $15,500
- Repair estimate dated before accident
- Duplicate invoice detected

**Agent Output:**

- Fraud Score: 82
- Risk Level: High
- Recommendation: Refer to Special Investigation Unit (SIU)

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
Fraud Agent
 │
Embedding
 │
 ▼
Pinecone
 │
Relevant Fraud Rules
 │
 ▼
Groq LLM
 │
Fraud Analysis
 │
 ▼
JSON Response
 │
 ▼
Master Orchestrator
```

---

## 18. Conclusion

The Fraud Detection Agent serves as the first line of defense against fraudulent insurance claims. By combining Retrieval-Augmented Generation with Groq LLM reasoning, it produces transparent, explainable, and evidence-backed fraud assessments. The agent significantly reduces manual investigation effort while improving fraud detection accuracy and supports investigators in making informed decisions.
