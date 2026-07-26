# PROJECT_CONTEXT.md

# AI Adversarial Claims Review Agent
## Backend Development Context (Member 2)

---

# Project Overview

This project is an AI-powered Insurance Claims Review System that assists insurance investigators
in detecting fraudulent or suspicious claims before approval.

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

Frontend → FastAPI Backend → AI Engine → Database

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

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Language      | Python 3.11+                            |
| Framework     | FastAPI                                 |
| Validation    | Pydantic v2                             |
| Database      | PostgreSQL (Supabase)                   |
| ORM           | SQLAlchemy 2.x (Async)                  |
| DB Driver     | asyncpg                                 |
| PDF           | PyMuPDF (fitz)                          |
| OCR           | EasyOCR + Pillow + NumPy                |
| Server        | Uvicorn                                 |
| Configuration | pydantic-settings + python-dotenv       |
| Testing       | Pytest + pytest-asyncio                 |
| Docs          | Swagger / OpenAPI (auto-generated)      |

---

# Architecture

```
Frontend
   ↓
FastAPI (app/main.py)
   ↓
Upload Endpoint          →  StorageService       →  uploads/ (local disk)
   ↓
Extract Endpoint         →  DocumentExtractionService
                                ↓
                         PDFExtractionService (PyMuPDF)
                                ↓  (if chars < 30)
                         OCRService (EasyOCR)
                                ↓
                         Supabase PostgreSQL
                         (claim_documents.raw_ocr_text)
   ↓
Analyze Endpoint         →  MockAIService  (→ LangGraph AI Engine later)
   ↓
Response
```

---

# Current Development Phase

✅ Backend folder structure
✅ FastAPI application setup (main.py, lifespan, CORS, middleware)
✅ Configuration (pydantic-settings, .env, all env vars validated)
✅ Logging (structured stdout logger, RequestLoggerMiddleware)
✅ Health endpoint (GET /api/v1/health — verifies DB with SELECT 1)
✅ Upload endpoint (POST /api/v1/upload — multipart PDF, validation, disk storage)
✅ PDF extraction service (PyMuPDF — text + page rendering)
✅ OCR service (EasyOCR — image-based fallback)
✅ Document extraction pipeline (POST /api/v1/documents/{id}/extract)
✅ Async database layer (SQLAlchemy 2.x async engine, asyncpg, Supabase)
✅ ORM models (Claim, ClaimDocument — reflect live Supabase schema)
✅ Request schemas (AnalyzeRequest)
✅ Response schemas (UploadResponse, ExtractionResponse, AnalyzeResponse, HealthResponse)
✅ Mock AI service (static response matching API contract)
✅ Analyze endpoint (POST /api/v1/analyze — backed by MockAIService)
✅ Error handling (typed exceptions, correct HTTP status codes throughout)

⬜ Database CRUD / repository layer
⬜ Replace MockAIService with real LangGraph AI Engine HTTP call
⬜ Authentication / JWT
⬜ Automated tests (pytest)

AI integration will happen AFTER Member 1 completes the AI Engine.

---

# Implemented File Map

```
backend/
├── app/
│   ├── main.py                          ✅ FastAPI app, lifespan, CORS, middleware
│   ├── api/
│   │   ├── api.py                       ✅ Root router — mounts /api/v1
│   │   └── v1/
│   │       ├── api.py                   ✅ v1 router — registers all endpoints
│   │       └── endpoints/
│   │           ├── health.py            ✅ GET  /api/v1/health
│   │           ├── upload.py            ✅ POST /api/v1/upload
│   │           ├── documents.py         ✅ POST /api/v1/documents/{document_id}/extract
│   │           └── analyze.py           ✅ POST /api/v1/analyze
│   ├── core/
│   │   ├── config.py                    ✅ Settings (pydantic-settings, .env)
│   │   └── logging.py                   ✅ Structured logger + setup_logging()
│   ├── db/
│   │   ├── database.py                  ✅ Async engine, async_sessionmaker, Base
│   │   ├── session.py                   ✅ get_db() async generator
│   │   ├── models.py                    ✅ Claim, ClaimDocument ORM models
│   │   └── __init__.py                  ✅ Exports engine, SessionLocal, Base, get_db
│   ├── schemas/
│   │   ├── common.py                    ✅ HealthResponse
│   │   ├── upload.py                    ✅ UploadResponse
│   │   ├── extraction.py                ✅ ExtractionResponse
│   │   └── analyze.py                   ✅ AnalyzeRequest, AnalyzeResponse, AgentAnalysis
│   ├── services/
│   │   ├── storage_service.py           ✅ StorageService — saves files to uploads/
│   │   ├── pdf_extraction_service.py    ✅ PDFExtractionService — text + PNG rendering
│   │   ├── ocr_service.py               ✅ OCRService — EasyOCR page-by-page
│   │   ├── document_extraction_service.py ✅ DocumentExtractionService — full pipeline
│   │   └── mock_ai.py                   ✅ MockAIService — static AI contract response
│   ├── middleware/
│   │   └── request_logger.py            ✅ RequestLoggerMiddleware — method/path/status/ms
│   └── utils/
│       ├── validators.py                ✅ is_valid_pdf()
│       └── helpers.py                   ✅ generate_id()
├── uploads/                             ✅ Local PDF storage directory
├── requirements.txt                     ✅ All dependencies pinned
├── .env                                 ✅ Local secrets (gitignored)
├── .env.example                         ✅ Template for all required env vars
└── PROJECT_CONTEXT.md                   ✅ This file
```

---

# API Endpoints

## GET /api/v1/health

Verifies service liveness and database connectivity.

Response (200):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

Response (503):
```json
{
  "status": "unhealthy",
  "database": "disconnected"
}
```

---

## POST /api/v1/upload

Accepts a single PDF file via multipart/form-data.

Validation:
- Extension must be `.pdf`
- File must not be empty
- File must not exceed `MAX_UPLOAD_SIZE_MB` (default 10 MB)

Stored as: `uploads/{uuid_hex}_{original_filename}.pdf`

Response (201):
```json
{
  "success": true,
  "file_id": "a3f9...",
  "filename": "claim_report.pdf",
  "stored_path": "uploads/a3f9..._claim_report.pdf",
  "message": "File uploaded successfully."
}
```

Error codes: 400 (invalid extension / empty), 413 (too large)

---

## POST /api/v1/documents/{document_id}/extract

Extracts text from a previously uploaded document.

Pipeline:
1. Looks up `document_id` in `claim_documents` table
2. Runs PyMuPDF text extraction
3. If extracted chars < 30 (OCR_FALLBACK_THRESHOLD), renders pages as PNG and runs EasyOCR
4. Writes `raw_ocr_text` and `page_count` back to `claim_documents`

Response (200) — digital PDF:
```json
{
  "document_id": "uuid-...",
  "page_count": 8,
  "method": "pymupdf",
  "characters": 12584,
  "ocr_used": false,
  "success": true
}
```

Response (200) — scanned PDF:
```json
{
  "document_id": "uuid-...",
  "page_count": 5,
  "method": "easyocr",
  "characters": 6231,
  "ocr_used": true,
  "success": true
}
```

Error codes: 404 (document not found), 422 (PDF missing/corrupted/encrypted), 500 (DB failure)

---

## POST /api/v1/analyze

Submits a claim for AI risk analysis.
Currently backed by MockAIService. Will be replaced with LangGraph AI Engine call.

This contract MUST NEVER be changed without team approval.

Request:
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

Response (200):
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
  "key_evidence": ["Repair estimate timestamp precedes incident date by 2 days."],
  "investigator_questions": ["Can claimant provide verified tow receipts?"],
  "final_recommendation": "REFER TO SPECIAL INVESTIGATION UNIT (SIU)"
}
```

---

# Database

## Connection

- Provider: Supabase (PostgreSQL)
- Driver: asyncpg
- ORM: SQLAlchemy 2.x async
- Session: `get_db()` async generator, injected via `Depends()`
- Engine config: `pool_pre_ping=True`, `echo=False`, `future=True`

## Tables Used (schema already exists in Supabase — DO NOT modify)

| Table               | Used for                                      |
|---------------------|-----------------------------------------------|
| `users`             | Not yet used by backend                       |
| `claims`            | ORM model defined — not yet used in endpoints |
| `claim_documents`   | Lookup by `document_id`; update `raw_ocr_text`, `page_count` |
| `agent_analyses`    | Not yet used by backend                       |
| `synthesis_reports` | Not yet used by backend                       |

## claim_documents columns written by backend

| Column        | Type    | Written by                        |
|---------------|---------|-----------------------------------|
| `raw_ocr_text`| text    | DocumentExtractionService.extract() |
| `page_count`  | integer | DocumentExtractionService.extract() |

---

# Environment Variables

All required. No defaults for secrets.

| Variable                  | Description                                      |
|---------------------------|--------------------------------------------------|
| `DATABASE_URL`            | `postgresql+asyncpg://...` — Supabase connection |
| `SUPABASE_URL`            | Supabase project URL                             |
| `SUPABASE_ANON_KEY`       | Supabase public anon key                         |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key                      |
| `UPLOAD_DIR`              | Local directory for uploaded files (default: `uploads`) |
| `MAX_UPLOAD_SIZE_MB`      | Max upload size in MB (default: `10`)            |
| `APP_NAME`                | Application name (default: `AI Claims Review Backend`) |
| `APP_VERSION`             | Application version (default: `1.0.0`)           |
| `DEBUG`                   | Boolean debug flag (default: `false`)            |
| `AI_ENGINE_URL`           | Future AI engine base URL (default: `http://localhost:8001`) |

---

# Service Responsibilities

| Service                       | Responsibility                                                  |
|-------------------------------|-----------------------------------------------------------------|
| `StorageService`              | Saves uploaded bytes to disk with UUID-prefixed filename        |
| `PDFExtractionService`        | Opens PDF with PyMuPDF; extracts text; renders pages as PNG     |
| `OCRService`                  | Runs EasyOCR on PNG page images; returns combined text          |
| `DocumentExtractionService`   | Orchestrates: DB lookup → PyMuPDF → OCR fallback → DB update   |
| `MockAIService`               | Returns static response matching the team API contract          |

---

# Extraction Pipeline Detail

```
POST /api/v1/documents/{document_id}/extract
        ↓
DocumentExtractionService.extract()
        ↓
SELECT claim_documents WHERE document_id = ?
        ↓
PDFExtractionService.extract_text(storage_path)
        ↓
  len(text) >= 30?
  ├── YES → method = "pymupdf"
  └── NO  → PDFExtractionService.render_pages_as_png()
                ↓
            OCRService.extract_text_from_images()
                ↓
            method = "easyocr"
        ↓
UPDATE claim_documents SET raw_ocr_text = ?, page_count = ?
        ↓
Return ExtractionResult
```

OCR fallback threshold: **30 characters** (`OCR_FALLBACK_THRESHOLD` in `pdf_extraction_service.py`)

---

# Folder Ownership

Only edit: `backend/`

Never edit: `frontend/`, `ai_engine/`, `README.md` (unless instructed)

---

# Coding Standards

Always:
- Follow FastAPI best practices
- Use async endpoints and async DB operations
- Keep business logic inside `services/`
- Keep endpoints thin — only HTTP concerns
- Use dependency injection (`Depends()`)
- Validate every request
- Use Pydantic models for all I/O
- Use modular architecture
- Add docstrings where useful
- Prefer type hints everywhere
- Follow REST principles
- Use `HTTPException` with correct status codes
- Log document_id, method, pages, chars, elapsed_ms for every extraction

Never:
- Hardcode secrets, file paths, or URLs
- Mix business logic inside routes
- Create tightly coupled modules
- Use synchronous database code
- Modify the Supabase schema

---

# Future Integration

## Next Steps (Backend)

1. Replace `MockAIService` with real HTTP call to `AI_ENGINE_URL` once Member 1 delivers
2. Implement repository/CRUD layer for `claims`, `agent_analyses`, `synthesis_reports`
3. Add JWT authentication
4. Write pytest test suite

## Integration Pattern (when AI Engine is ready)

```python
# In MockAIService — replace with:
async with httpx.AsyncClient() as client:
    response = await client.post(
        f"{settings.AI_ENGINE_URL}/analyze",
        json=payload.model_dump()
    )
    return AnalyzeResponse(**response.json())
```

The API contract for `/api/v1/analyze` must remain unchanged so frontend integration is seamless.

---

# Goal

Develop a clean, scalable, maintainable backend that integrates with:

- React Frontend (Member 3)
- LangGraph AI Engine (Member 1)
- PostgreSQL Database (Supabase)

without requiring major architectural changes.
