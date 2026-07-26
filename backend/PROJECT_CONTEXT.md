# PROJECT_CONTEXT.md

# AI Adversarial Claims Review Agent
## Backend Development Context (Member 2)

---

# Project Overview

This project is an AI-powered Insurance Claims Review System that assists insurance investigators in detecting fraudulent or suspicious claims before approval.

The complete system consists of three independent modules developed by different team members.

```
Repository Structure

ai-claims-review-agent/
│
├── ai_engine/      ← Member 1
├── backend/        ← Member 2 (ME)
├── frontend/       ← Member 3
└── README.md
```

---

# My Responsibility

I am **Member 2**.

I ONLY work inside:

```
backend/
```

I do NOT own:

- frontend/
- ai_engine/

Never modify or generate code for those folders unless explicitly instructed.

---

# Backend Responsibilities

The backend acts as the bridge between:

Frontend
↓

FastAPI Backend

↓

AI Engine

↓

Database

The backend is responsible for:

- REST API development
- PDF upload handling
- OCR & text extraction
- Request validation
- Database interaction
- File storage
- API documentation
- Error handling
- Logging
- Future integration with the AI Engine

The backend is NOT responsible for:

- Fraud detection logic
- LLM prompts
- LangGraph
- Pinecone
- React UI
- Dashboard
- Charts

---

# Technology Stack

Language
- Python 3.11+

Framework
- FastAPI

Validation
- Pydantic v2

Database
- PostgreSQL
- SQLAlchemy

OCR
- PyMuPDF
- EasyOCR

Server
- Uvicorn

Configuration
- python-dotenv

Testing
- Pytest

Documentation
- Swagger/OpenAPI

---

# Architecture

Frontend

↓

FastAPI

↓

Upload Service

↓

PDF Processing

↓

OCR

↓

Extracted Text

↓

Analyze Endpoint

↓

Mock AI Service

↓

Response

Later:

Mock AI Service

↓

LangGraph AI Engine

---

# API Contract

This contract MUST NEVER be changed without team approval.

## POST /api/v1/analyze

Request

```json
{
  "claim_id": "CLM-2026-9901",
  "policy_number": "POL-88321",
  "claimant_name": "John Doe",
  "claim_amount": 15500.00,
  "claim_type": "Auto Collision",
  "extracted_text": "Claimant states vehicle hit guardrail..."
}
```

Response

```json
{
  "claim_id": "CLM-2026-9901",
  "overall_risk_score": 78,
  "risk_level": "HIGH",
  "fraud_score": 82,
  "agent_analysis": {
    "fraud_agent": {
      "flags": [
        "Duplicate invoice"
      ],
      "score": 82
    },
    "medical_agent": {
      "flags": [
        "Timeline discrepancy"
      ],
      "score": 60
    },
    "compliance_agent": {
      "status": "APPROVED_WITH_CONDITIONS"
    }
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

---

# Current Development Phase

Current Phase

✅ Backend folder structure

⬜ FastAPI application setup

⬜ Configuration

⬜ Health endpoint

⬜ Upload endpoint

⬜ PDF extraction

⬜ OCR fallback

⬜ Request schemas

⬜ Response schemas

⬜ Mock AI service

⬜ Analyze endpoint

⬜ Database

⬜ Logging

⬜ Error handling

⬜ Testing

AI integration will happen AFTER Member 1 completes the AI Engine.

---

# Folder Ownership

Only edit:

backend/

Never edit:

frontend/

ai_engine/

README.md (unless instructed)

---

# Coding Standards

Always:

- Follow FastAPI best practices.
- Use async endpoints where appropriate.
- Keep business logic inside services/.
- Keep endpoints thin.
- Use dependency injection.
- Validate every request.
- Use Pydantic models.
- Use modular architecture.
- Write production-ready code.
- Add docstrings where useful.
- Prefer type hints.
- Follow REST principles.

Never:

- Hardcode secrets.
- Hardcode file paths.
- Hardcode URLs.
- Mix business logic inside routes.
- Create tightly coupled modules.

---

# Future Integration

Currently

Frontend

↓

Backend

↓

Mock AI

Later

Frontend

↓

Backend

↓

LangGraph AI Engine

The API contract must remain unchanged so integration is seamless.

---

# Goal

Develop a clean, scalable, maintainable backend that can be integrated with:

- React Frontend
- LangGraph AI Engine
- PostgreSQL Database

without requiring major architectural changes.