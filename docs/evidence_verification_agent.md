# Evidence Verification Agent

## AI Adversarial Claims Review System

---

## 1. Overview

The Evidence Verification Agent is one of the five specialized AI agents in the AI Adversarial Claims Review System. Its primary responsibility is to cross-check all submitted evidence — documents, timestamps, witness statements, and repair records — for consistency and completeness.

The agent uses Retrieval-Augmented Generation (RAG) to retrieve evidence verification standards from Pinecone and combines it with Groq Llama 3.3 70B reasoning to produce explainable evidence assessments.

---

## 2. Problem Statement

Fraudulent claims often contain subtle inconsistencies across submitted documents — timestamps that don't align, missing mandatory evidence, or conflicting witness statements. Manual cross-checking is time-consuming and error-prone.

Common evidence issues include:

- Repair estimates dated before the incident
- Missing police reports for high-value claims
- Conflicting witness statements
- Inconsistent vehicle damage descriptions
- Missing tow receipts or medical records
- Altered document metadata

---

## 3. Objective

- Cross-check all submitted evidence for consistency
- Identify missing mandatory documents
- Detect timestamp and timeline conflicts
- Flag document authenticity concerns
- Calculate an evidence consistency score (0–100)
- Generate explainable evidence findings

---

## 4. Responsibilities

- Analyze all submitted claim documents
- Retrieve evidence standards using RAG
- Cross-check timestamps and timelines
- Identify missing evidence
- Detect document conflicts
- Calculate consistency score
- Generate evidence-backed findings

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
(Filter = evidence)
     │
Top-K Evidence Standards
     │
     ▼
Groq Llama 3.3 70B
     │
Evidence Reasoning
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
  "extracted_text": "Repair estimate dated 2 days before accident. No police report submitted..."
}
```

---

## 7. Knowledge Base

Knowledge sources retrieved from Pinecone (domain = `evidence`):

- Evidence documentation standards
- Mandatory document checklists by claim type
- Timestamp verification rules
- Document authenticity guidelines
- Witness statement evaluation criteria
- Chain of custody requirements

---

## 8. Processing Workflow

1. Receive extracted claim text
2. Generate embeddings using Gemini
3. Search Pinecone with `domain=evidence` filter
4. Retrieve top-5 relevant evidence standard chunks
5. Inject context into prompt
6. Send prompt to Groq Llama 3.3 70B
7. Cross-check evidence consistency
8. Apply heuristic fallback (police report check)
9. Return structured JSON

---

## 9. RAG Pipeline

```
Claim Text
     │
Gemini Embedding
     │
Pinecone Similarity Search (domain=evidence)
     │
Evidence Standards Knowledge
     │
Prompt Construction
     │
Groq LLM
     │
Evidence Analysis
```

---

## 10. LLM Reasoning

The agent uses **Groq Llama 3.3 70B Versatile** to evaluate:

- Timestamp consistency across all documents
- Presence of mandatory evidence items
- Conflicts between submitted documents
- Authenticity indicators
- Completeness of evidence package

---

## 11. Output

```json
{
  "consistency_score": 45,
  "missing_evidence": [
    "Police report missing for damage > $3,000",
    "Tow receipt not provided"
  ],
  "conflicts": [
    "Repair estimate dated 2 days before reported accident date"
  ],
  "reasoning": "Critical timeline conflict detected. Repair estimate precedes incident date, suggesting pre-staged damage."
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

- Detects `without police report` or `no police report` in claim text
- Appends `"Police report missing for damage > $3,000"` to missing evidence list

---

## 14. Advantages

- Automated cross-document consistency checking
- Detects subtle timeline conflicts
- Explainable findings with specific conflicts listed
- Heuristic fallback ensures output on LLM failure
- Runs in parallel with other agents

---

## 15. Limitations

- Cannot access original document metadata directly
- Depends on OCR quality for text extraction
- Cannot verify physical document authenticity
- Complex multi-document scenarios may need human review

---

## 16. Future Enhancements

- Document metadata (EXIF) analysis
- Image forensics for photo manipulation detection
- Automated police report API verification
- Digital signature validation
- Blockchain-based document chain of custody

---

## 17. Sample Scenario

**Input:**

- Repair estimate date: 2 days before accident date
- Police report: Not submitted
- Claim amount: $15,500

**Agent Output:**

- Consistency Score: 45
- Missing Evidence: Police report missing for damage > $3,000
- Conflict: Repair estimate dated before accident
- Reasoning: Critical timeline conflict — pre-staged damage suspected

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
Evidence Agent
 │
Gemini Embedding
 │
 ▼
Pinecone (domain=evidence)
 │
Evidence Standards Knowledge
 │
 ▼
Groq LLM
 │
Evidence Analysis
 │
 ▼
JSON Response
 │
 ▼
Master Orchestrator
```

---

## 19. Conclusion

The Evidence Verification Agent provides automated, systematic cross-checking of all claim evidence for consistency, completeness, and authenticity. By combining evidence standards retrieved via RAG with LLM reasoning, it detects timeline conflicts and missing documents that are strong indicators of fraudulent claims, significantly reducing the manual effort required for evidence review.
