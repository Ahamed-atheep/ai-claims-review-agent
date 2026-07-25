# AI Adversarial Claims Review Agent

An intelligent, multi-agent AI system that assists insurance reviewers by analyzing claims, retrieving policy & fraud knowledge via RAG, detecting risk/fraud, and generating explainable decision reports.

---

## 🏗️ Repository Architecture

```text
ai-claims-review-agent/
├── ai_engine/       <-- Member 1 (AI Engine, RAG Pipeline, LangGraph Agents)
├── backend/         <-- Member 2 (FastAPI REST Server, PyMuPDF OCR, PostgreSQL)
├── frontend/        <-- Member 3 (React + Tailwind UI Dashboard)
├── .gitignore
└── README.md
```

---

## 👥 Team Branching Strategy

| Branch | Folder | Owner | Role |
| :--- | :--- | :--- | :--- |
| `feature/member-1-ai-rag` | `ai_engine/` | Member 1 | Gemini RAG, Pinecone, LangGraph Multi-Agent Workflow |
| `feature/member-2-backend` | `backend/` | Member 2 | FastAPI REST APIs, PDF OCR Extraction, Database |
| `feature/member-3-frontend` | `frontend/` | Member 3 | React UI Dashboard, Risk Scorecard, PDF Exporter |
| `main` | Entire Repo | Team | Stable Integration Branch |

---

## 📋 Shared API Contract (JSON Schema)

### `POST /api/v1/analyze` Request Payload:
```json
{
  "claim_id": "CLM-2026-9901",
  "policy_number": "POL-88321",
  "claimant_name": "John Doe",
  "claim_amount": 15500.00,
  "claim_type": "Auto Collision",
  "extracted_text": "Claimant states vehicle hit a guardrail..."
}
```

### Response Payload:
```json
{
  "claim_id": "CLM-2026-9901",
  "overall_risk_score": 78,
  "risk_level": "HIGH",
  "fraud_score": 82,
  "agent_analysis": {
    "fraud_agent": { "flags": ["Duplicate invoice"], "score": 82 },
    "medical_agent": { "flags": ["Timeline discrepancy"], "score": 60 },
    "compliance_agent": { "status": "APPROVED_WITH_CONDITIONS" }
  },
  "key_evidence": [
    "Repair estimate timestamp precedes incident date by 2 days."
  ],
  "investigator_questions": [
    "Can claimant provide verified tow receipts?"
  ],
  "final_recommendation": "REFER TO SPECIAL INVESTIGATION UNIT (SIU)"
}
```
