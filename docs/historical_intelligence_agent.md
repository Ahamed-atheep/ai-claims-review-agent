# Historical Intelligence Agent

## AI Adversarial Claims Review System

---

## 1. Overview

The Historical Intelligence Agent is one of the five specialized AI agents in the AI Adversarial Claims Review System. Its primary responsibility is to compare the current claim against historical fraud patterns, known fraud schemes, and past claim records to identify suspicious similarities.

The agent uses Retrieval-Augmented Generation (RAG) to retrieve historical fraud pattern knowledge from Pinecone and combines it with Groq Llama 3.3 70B reasoning to produce explainable historical risk assessments.

---

## 2. Problem Statement

Fraudsters often repeat the same schemes across multiple claims, sometimes across different insurers. Without historical pattern matching, these repeat offenders go undetected.

Common historical fraud patterns include:

- Same claimant filing multiple similar claims
- Repeated use of the same repair shop across suspicious claims
- Known fraud ring patterns
- Seasonal fraud spikes
- Geographic fraud hotspots
- Identical claim narratives with minor variations

---

## 3. Objective

- Compare current claim against historical fraud patterns
- Identify matches with known fraud schemes
- Detect repeat offender indicators
- Calculate a historical similarity score (0–100)
- Generate explainable pattern match findings
- Support SIU with historical intelligence

---

## 4. Responsibilities

- Analyze claim against historical fraud knowledge
- Retrieve historical pattern data using RAG
- Identify matching fraud schemes
- Detect repeat claimant or repair shop patterns
- Calculate similarity score
- Generate matched pattern list with reasoning

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
(Filter = historical)
     │
Top-K Historical Fraud Patterns
     │
     ▼
Groq Llama 3.3 70B
     │
Pattern Matching Reasoning
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
  "extracted_text": "Claimant states vehicle hit a guardrail on an isolated road at night..."
}
```

---

## 7. Knowledge Base

Knowledge sources retrieved from Pinecone (domain = `historical`):

- Historical fraud case summaries
- Known fraud ring patterns
- Repeat claimant indicators
- Seasonal and geographic fraud trends
- Common fraud narrative templates
- SIU investigation outcomes

---

## 8. Processing Workflow

1. Receive extracted claim text
2. Generate embeddings using Gemini
3. Search Pinecone with `domain=historical` filter
4. Retrieve top-5 relevant historical pattern chunks
5. Inject context into prompt
6. Send prompt to Groq Llama 3.3 70B
7. Match claim against historical patterns
8. Calculate similarity score
9. Return structured JSON

---

## 9. RAG Pipeline

```
Claim Text
     │
Gemini Embedding
     │
Pinecone Similarity Search (domain=historical)
     │
Historical Fraud Pattern Knowledge
     │
Prompt Construction
     │
Groq LLM
     │
Pattern Match Analysis
```

---

## 10. LLM Reasoning

The agent uses **Groq Llama 3.3 70B Versatile** to evaluate:

- Similarity to known fraud narratives
- Repeat claimant or repair shop indicators
- Geographic and seasonal fraud pattern matches
- Known fraud ring involvement indicators
- Claim amount patterns matching historical fraud cases

---

## 11. Output

```json
{
  "similarity_score": 72,
  "matched_patterns": [
    "Isolated road collision — known staged accident pattern",
    "Nighttime incident with no witnesses — matches Pattern #FR-2024-047"
  ],
  "reasoning": "Claim narrative closely matches 3 historical staged collision cases from 2024. Isolated location and no witnesses are high-risk indicators."
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

- Detects repeat fraud patterns invisible to other agents
- Evidence-backed pattern matching
- Supports SIU with historical intelligence
- Runs in parallel with other agents
- Continuously improvable by updating knowledge base

---

## 14. Limitations

- Knowledge base must be regularly updated with new fraud cases
- Cannot query live claims databases directly
- Pattern matching depends on quality of historical knowledge ingested
- Novel fraud schemes not yet in knowledge base will be missed

---

## 15. Future Enhancements

- Cross-insurer fraud pattern sharing network
- Graph-based fraud ring detection
- Real-time fraud pattern ingestion pipeline
- Claimant history database integration
- Adaptive pattern learning from confirmed fraud cases

---

## 16. Sample Scenario

**Input:**

- Claim Type: Auto Collision
- Location: Isolated road, nighttime
- No witnesses
- Claim Amount: $15,500

**Agent Output:**

- Similarity Score: 72
- Matched Pattern: Isolated road staged collision — Pattern #FR-2024-047
- Reasoning: Narrative matches 3 historical staged collision cases from 2024

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
Historical Agent
 │
Gemini Embedding
 │
 ▼
Pinecone (domain=historical)
 │
Historical Fraud Pattern Knowledge
 │
 ▼
Groq LLM
 │
Pattern Match Analysis
 │
 ▼
JSON Response
 │
 ▼
Master Orchestrator
```

---

## 18. Conclusion

The Historical Intelligence Agent provides a critical layer of fraud detection by comparing current claims against a rich knowledge base of historical fraud patterns. By combining Pinecone RAG retrieval with Groq LLM reasoning, it identifies repeat fraud schemes and known patterns that would otherwise require extensive manual investigation, providing SIU teams with actionable historical intelligence.
