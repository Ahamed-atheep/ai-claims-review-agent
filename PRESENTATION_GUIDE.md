# AI Adversarial Claims Review Agent — Complete Presentation Guide

---

## 1. Elevator Pitch (30 seconds)

> "We built an AI-powered insurance claims fraud detection system. You upload a claim PDF, and 5 specialized AI agents simultaneously analyze it for fraud, medical inconsistencies, policy violations, evidence gaps, and historical fraud patterns — then synthesize a risk score and SIU referral recommendation in under 60 seconds."

---

## 2. The Problem It Solves

- Insurance fraud costs the industry **$80 billion/year** globally
- Manual claim review is slow, inconsistent, and misses subtle fraud patterns
- A single investigator cannot simultaneously check fraud rules, medical benchmarks, policy compliance, and historical patterns at once
- This system does all 5 **in parallel, in seconds, with explainable evidence**

---

## 3. System Architecture

```
User uploads PDF
      ↓
[Frontend — React + TypeScript]
      ↓  POST /api/v1/claims/upload
[Backend — FastAPI]
  ├── PyMuPDF OCR → extracts text from PDF
  ├── Saves claim to PostgreSQL (Supabase)
  └── Returns claim_id + stream_url
      ↓  SSE stream opens
[Backend triggers AI Engine]
      ↓
[AI Engine — MasterOrchestrator]
  ├── asyncio.gather() → 5 agents run IN PARALLEL
  │     ├── FraudAgent       → Pinecone RAG (domain=fraud)      → Groq LLM
  │     ├── MedicalAgent     → Pinecone RAG (domain=medical)    → Groq LLM
  │     ├── PolicyAgent      → Pinecone RAG (domain=policy)     → Groq LLM
  │     ├── EvidenceAgent    → Pinecone RAG (domain=evidence)   → Groq LLM
  │     └── HistoricalAgent  → Pinecone RAG (domain=historical) → Groq LLM
  └── MasterSynthesisAgent → aggregates all 5 → final JSON
      ↓
[Backend persists to PostgreSQL]
  ├── agent_analyses table (1 row per agent)
  └── synthesis_reports table
      ↓  GET /api/v1/analyze/{id}
[Frontend renders Risk Dashboard]
```

---

## 4. Repository Structure

```
ai-claims-review-agent/
├── ai_engine/               ← Member 1: AI Engine, RAG Pipeline, Agents
│   ├── agents/              ← 5 specialized agent classes
│   ├── orchestrator/        ← MasterOrchestrator, ParallelRunner, Synthesis
│   ├── rag/                 ← Pinecone vector store, embeddings, retriever
│   ├── knowledge_base/      ← Domain knowledge text files (ingested to Pinecone)
│   ├── prompts/             ← Per-agent LLM prompt templates
│   ├── models/              ← Pydantic request/response models
│   ├── services/            ← LLM service (Groq), Pinecone service
│   └── main.py              ← Standalone FastAPI server (port 8001)
│
├── backend/                 ← Member 2: FastAPI REST Server, OCR, Database
│   ├── app/
│   │   ├── api/v1/          ← REST endpoints (claims, analyze, documents, health)
│   │   ├── services/        ← ClaimService, AnalysisService, DocumentService, OCR
│   │   ├── crud/            ← Raw DB operations (claim_crud, analysis_crud)
│   │   ├── db/              ← SQLAlchemy models, session, database connection
│   │   ├── schemas/         ← Pydantic schemas for all API contracts
│   │   └── main.py          ← FastAPI app entry point (port 8000)
│   └── uploads/             ← Uploaded PDF files stored here
│
└── frontend/                ← Member 3: React UI Dashboard
    ├── src/
    │   ├── pages/           ← LandingPage, DashboardPage, ClaimsHistoryPage, etc.
    │   ├── components/      ← UI components (upload, dashboard, charts, report)
    │   ├── hooks/           ← useClaimUpload, useSSEStream
    │   ├── store/           ← Zustand global state (useClaimStore)
    │   └── lib/             ← api.ts (all API calls), utils.ts
    └── .env                 ← VITE_API_BASE_URL, VITE_USE_MOCK
```

---

## 5. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Fast, type-safe SPA |
| Styling | Tailwind CSS | Utility-first CSS |
| Animations | Framer Motion | Smooth UI transitions |
| 3D Background | Three.js / R3F | Interactive 3D canvas |
| State Management | Zustand | Lightweight global store |
| Backend | FastAPI (Python 3.11) | Async REST API, auto Swagger docs |
| OCR | PyMuPDF | PDF text extraction |
| Database | PostgreSQL on Supabase | Managed cloud DB |
| ORM | SQLAlchemy (async) + asyncpg | Type-safe async DB queries |
| AI Agents | Custom Python classes | 5 domain-specialized agents |
| LLM | Groq — Llama 3.3 70B Versatile | Ultra-fast LPU inference |
| Embeddings | Google Gemini `gemini-embedding-001` | 3072-dimensional vectors |
| Vector DB | Pinecone | Semantic similarity search with metadata filtering |
| Streaming | Server-Sent Events (SSE) | Real-time progress to frontend |
| PDF Export | jsPDF / react-pdf | Downloadable investigation report |

---

## 6. The RAG Pipeline (Retrieval Augmented Generation)

### What is RAG?
Instead of asking the LLM to rely on its training data alone, we pre-loaded a **knowledge base of insurance domain documents** into Pinecone. Each agent retrieves the top 5 most relevant chunks for the specific claim before reasoning.

### Step-by-Step RAG Flow

```
1. Claim text (from OCR)
        ↓
2. Gemini Embeddings → 3072-dimensional vector
        ↓
3. Pinecone similarity_search(query_vector, top_k=5, filter={"domain": "fraud"})
        ↓
4. Returns top 5 matching knowledge chunks
        ↓
5. Chunks injected into LLM prompt as [CONTEXT]
        ↓
6. Groq Llama 3.3 70B reasons over: Claim + Context → JSON output
```

### Knowledge Base Files (pre-ingested into Pinecone)

| File | Domain Tag | Content |
|---|---|---|
| `fraud_rules_catalog.txt` | `fraud` | Known fraud indicators and red flags |
| `insurance_fraud_indicators_master.txt` | `fraud` | Detailed fraud pattern catalog |
| `medical_and_auto_repair_benchmarks.txt` | `medical` | Regional cost benchmarks |
| `medical_benchmarks.txt` | `medical` | Medical procedure cost standards |
| `auto_insurance_policy_master.txt` | `policy` | Policy coverage rules |
| `auto_policy_apex.txt` | `policy` | Extended policy terms |
| `evidence_rules_master.txt` | `evidence` | Evidence requirements per claim type |
| `historical_fraud_patterns_master.txt` | `historical` | Past fraud case patterns |

---

## 7. The 5 AI Agents

| Agent | Domain | What It Analyzes |
|---|---|---|
| **FraudAgent** | `fraud` | Duplicate invoices, billing inflation (>300% regional avg), timestamp manipulation, pre-dated repair estimates |
| **MedicalAgent** | `medical` | ICD-10 code mismatches, treatment timeline inconsistencies, procedure cost vs. benchmark |
| **PolicyAgent** | `policy` | Coverage limits exceeded, policy exclusions violated, compliance status |
| **EvidenceAgent** | `evidence` | Missing required documents, conflicting evidence, photo/VIN verification gaps |
| **HistoricalAgent** | `historical` | Pattern matching against known fraud cases, repeat claimant detection |

All 5 run **simultaneously** via `asyncio.gather()` — not sequentially. This is the core performance advantage.

### Agent Class Hierarchy

```
BaseAgent (abstract)
  ├── __init__(name, domain, prompt_file)
  ├── _load_prompt()       ← loads from prompts/*.txt
  ├── _parse_json_response() ← safely extracts JSON from LLM output
  └── analyze() [abstract] ← each agent implements this

FraudAgent(BaseAgent)     domain=fraud
MedicalAgent(BaseAgent)   domain=medical
PolicyAgent(BaseAgent)    domain=policy
EvidenceAgent(BaseAgent)  domain=evidence
HistoricalAgent(BaseAgent) domain=historical
```

---

## 8. MasterOrchestrator Flow

```python
# 1. Receive claim request
MasterOrchestrator.analyze_claim(ClaimAnalysisRequest)

# 2. Run all 5 agents in parallel
ParallelRunner.run_all(claim_data)
  → asyncio.gather(fraud, medical, policy, evidence, historical)

# 3. Synthesize into final API contract response
MasterSynthesisAgent.synthesize(claim_data, agent_outputs)
  → Groq LLM call with all 5 agent outputs
  → Returns ClaimAnalysisResponse (exact JSON contract)
```

---

## 9. Database Schema

```
claims
  ├── claim_id          UUID (Primary Key)
  ├── claim_number      VARCHAR
  ├── policy_number     VARCHAR
  ├── claimant_name     VARCHAR
  ├── claim_type        VARCHAR
  ├── claimed_amount    FLOAT
  └── status            ENUM (PENDING, PROCESSING, COMPLETED, FAILED, FLAGGED_MANUAL_REVIEW)

claim_documents
  ├── document_id       UUID (Primary Key)
  ├── claim_id          UUID (Foreign Key → claims)
  ├── file_name         VARCHAR
  ├── storage_path      VARCHAR
  ├── mime_type         VARCHAR
  ├── page_count        INTEGER
  └── raw_ocr_text      TEXT (extracted by PyMuPDF)

agent_analyses
  ├── analysis_id       UUID (Primary Key)
  ├── claim_id          UUID (Foreign Key → claims)
  ├── agent_name        VARCHAR (fraud_agent, medical_agent, compliance_agent)
  ├── risk_score        INTEGER (0–100)
  ├── risk_level        ENUM (LOW, MEDIUM, HIGH, CRITICAL)
  ├── findings          JSONB (flags[], status, confidence)
  └── execution_time_ms INTEGER

synthesis_reports
  ├── report_id         UUID (Primary Key)
  ├── claim_id          UUID (Foreign Key → claims)
  ├── overall_risk_score  INTEGER (0–100)
  ├── overall_risk_level  ENUM (LOW, MEDIUM, HIGH, CRITICAL)
  ├── recommended_action  ENUM (APPROVE, REJECT, ESCALATE_TO_INVESTIGATOR)
  ├── executive_summary   TEXT
  ├── red_flags           JSONB array
  └── investigator_questions JSONB array
```

---

## 10. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/claims/upload` | Upload PDF + claim metadata (multipart/form-data) |
| `GET` | `/api/v1/claims/{id}/stream` | SSE real-time analysis progress |
| `GET` | `/api/v1/claims` | List all claims (paginated) |
| `GET` | `/api/v1/claims/{id}` | Get single claim details |
| `POST` | `/api/v1/analyze` | Run AI analysis on a claim |
| `GET` | `/api/v1/analyze/{id}` | Fetch persisted analysis result |
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/docs` | Auto-generated Swagger UI |

### Shared API Contract (agreed by all 3 members)

**Request:**
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

**Response:**
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

## 11. Frontend Pages & Components

| Page | Route (nav) | Purpose |
|---|---|---|
| `LandingPage` | `/` | Hero, upload form, feature highlights |
| `DashboardPage` | `dashboard` | Risk scorecard, agent findings, PDF viewer |
| `ClaimsHistoryPage` | `claims` | All claims from DB with search/filter |
| `AnalyticsPage` | `analysis` | Platform KPIs, fraud pattern charts |
| `DocumentsPage` | `documents` | Document vault |
| `SettingsPage` | `settings` | AI model config, risk thresholds |

### Dashboard Tabs
1. **Overview** — Score gauge + recommendation banner + key evidence
2. **Risk Radar** — Pentagon chart showing all 5 agent scores
3. **Agent Findings** — Accordion cards per agent with flags
4. **Red Flags** — All flagged risk indicators combined
5. **Questions** — AI-generated investigator questions (click to copy)
6. **Export** — Download PDF investigation report

---

## 12. Real-Time SSE Streaming Flow

```
Frontend opens EventSource → GET /api/v1/claims/{id}/stream
                                        ↓
Backend SSE generator starts:
  emit → { step: "OCR_COMPLETE",   progress: 20 }   (after 1.5s)
  emit → { step: "RAG_RETRIEVAL",  progress: 45 }   (after 1.5s)
  [AI Engine running in background via asyncio.create_task()]
  emit → { step: "AGENTS_RUNNING", progress: 75 }   (after 2.5s)
  emit → { step: "SYNTHESIS",      progress: 90 }   (after 2.5s)
  await analysis_task  ← waits for real AI to finish
  emit → { step: "COMPLETED",      progress: 100 }
                                        ↓
Frontend onComplete() → GET /api/v1/analyze/{id} → setReport() → Dashboard renders
```

---

## 13. How to Run the Project

### Prerequisites
- Python 3.11+
- Node.js 18+
- API keys: Groq, Google Gemini, Pinecone, Supabase

### Step 1 — Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2 — Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Step 3 — Verify
- Backend Swagger docs: `http://localhost:8000/docs`
- Frontend: `http://localhost:5173`

### Environment Files
- `backend/.env` — DATABASE_URL, SUPABASE keys, AI_ENGINE_URL
- `ai_engine/.env` — GROQ_API_KEY, GEMINI_API_KEY, PINECONE_API_KEY
- `frontend/.env` — VITE_API_BASE_URL, VITE_USE_MOCK

---

## 14. Key Technical Achievements

| Achievement | Detail |
|---|---|
| **Parallel agent execution** | `asyncio.gather()` runs all 5 agents concurrently — not sequentially |
| **Domain-filtered RAG** | Each agent retrieves only from its own Pinecone domain via metadata filter |
| **Real-time SSE streaming** | Live progress updates without polling |
| **3-tier fallback chain** | Direct import → HTTP bridge → MockAI — system never crashes |
| **Full DB persistence** | Every analysis stored with FK integrity across 4 tables |
| **Adversarial design** | Agents challenge the claim from 5 different adversarial angles |
| **3-tier architecture** | Frontend / Backend / AI Engine fully separated and independently deployable |
| **Auto Swagger docs** | Full API documentation auto-generated at `/docs` |

---

## 15. Likely Faculty Questions & Answers

**Q: Why use RAG instead of just prompting the LLM directly?**
> RAG grounds the LLM in verified domain knowledge — our fraud rules, policy documents, and medical benchmarks. Without RAG, the LLM hallucinates generic answers. With RAG, every flag is backed by a retrieved document chunk from our knowledge base.

**Q: Why Pinecone instead of a local vector store like FAISS?**
> Pinecone is a managed cloud vector database with sub-100ms similarity search at scale. It supports metadata filtering so each agent only retrieves from its own domain. FAISS would require us to manage the index ourselves and doesn't support metadata filtering natively.

**Q: Why Groq instead of OpenAI GPT-4?**
> Groq uses LPU (Language Processing Unit) hardware — it delivers 10x faster inference than GPU-based providers. Llama 3.3 70B on Groq gives sub-500ms responses per agent, which is critical when 5 agents run in parallel.

**Q: What is the "adversarial" part of the system?**
> Each agent independently analyzes the claim from a different adversarial angle — the fraud agent looks for deception, the evidence agent looks for missing proof, the historical agent compares to known fraud cases. The synthesis agent then weighs all 5 findings against each other, creating a cross-checking adversarial pipeline.

**Q: How does SSE differ from WebSockets?**
> SSE is one-way (server → client) over standard HTTP. WebSockets are bidirectional. For progress streaming, SSE is simpler, more reliable, and doesn't require a separate protocol upgrade. The browser's native `EventSource` API handles reconnection automatically.

**Q: What happens if the AI engine crashes mid-analysis?**
> Three-tier fallback: (1) direct Python import of MasterOrchestrator, (2) HTTP bridge to `localhost:8001`, (3) MockAIService with static response. The backend logs a warning but always returns a valid response.

**Q: How is sensitive data protected?**
> Supabase PostgreSQL with service role key stored in `.env` (never committed). UUID primary keys are non-guessable. CORS is restricted to known origins. No PII is logged. Uploaded PDFs are stored locally with hashed filenames.

**Q: Why asyncio instead of threading for parallel agents?**
> All agent operations are I/O-bound (HTTP calls to Groq API and Pinecone). `asyncio` is ideal for I/O-bound concurrency — it uses a single thread with an event loop, avoiding thread overhead and race conditions. `asyncio.gather()` lets all 5 agents await their API calls concurrently.

**Q: How did the 3 team members collaborate without conflicts?**
> We defined a shared API contract (JSON schema) upfront that all 3 members agreed on. Each member worked in their own folder (`ai_engine/`, `backend/`, `frontend/`) on separate Git branches. The contract was the integration point — Member 2 backend called Member 1 AI engine, Member 3 frontend called Member 2 backend.

---

## 16. Demo Script (step by step for live demo)

1. Open `http://localhost:5173` — show the landing page with 3D animated background
2. Point out the tech stack pill: *"Gemini 2.0 Pro · Llama 3.3 70B · Pinecone RAG"*
3. Fill in the claim form:
   - Claim Number: `CLM-2026-9901`
   - Policy Number: `POL-88321`
   - Claimant Name: `John Doe`
   - Amount: `15500`
   - Type: `Auto Collision`
   - Upload: `Sample_Auto_Claim_CLM_2026_9901.pdf`
4. Click **Run AI Analysis** — show the progress modal with live SSE steps
5. Point out the animated agent orbs when `AGENTS_RUNNING` fires
6. Dashboard loads — walk through each tab:
   - Overview: risk score gauge + recommendation
   - Risk Radar: pentagon chart
   - Agent Findings: expand each agent card
   - Red Flags: all combined flags
   - Questions: click to copy an investigator question
7. Navigate to **Claims History** — show the newly submitted claim in the table
8. Open `http://localhost:8000/docs` — show the auto-generated Swagger API docs

---

*Document generated for team presentation — AI Adversarial Claims Review Agent*
