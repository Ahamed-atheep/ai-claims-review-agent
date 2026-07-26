# Claims Review Backend

FastAPI backend for the AI Adversarial Claims Review Agent.

## Architecture

```
app/
├── api/          # Route definitions (versioned)
├── core/         # Config, logging, security
├── db/           # SQLAlchemy engine, session, ORM models
├── schemas/      # Pydantic request/response models
├── services/     # Business logic (PDF, OCR, storage, mock AI)
├── middleware/   # Request logging
├── dependencies/ # FastAPI Depends() helpers
├── utils/        # Validators and helpers
└── main.py       # App factory
```

## Running

```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Swagger UI: http://localhost:8000/docs

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Liveness check |
| POST | `/api/v1/upload` | Upload PDF claim document |
| POST | `/api/v1/analyze` | Analyze claim (mock AI) |
