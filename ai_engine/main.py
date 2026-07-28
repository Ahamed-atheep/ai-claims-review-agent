import os
import sys

# Add parent directory to sys.path so 'ai_engine' module imports resolve seamlessly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_engine.api import router as ai_router
from ai_engine.config import config
from ai_engine.utils.logger import logger

app = FastAPI(
    title="AI Adversarial Claims Review Engine",
    description="Multi-Agent AI Engine for insurance claim risk auditing.",
    version="1.0.0"
)

# Enable CORS for frontend / backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_URL, config.BACKEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AI Engine API router
app.include_router(ai_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai_engine"}

if __name__ == "__main__":
    logger.info(f"Starting AI Engine server on {config.HOST}:{config.PORT}...")
    uvicorn.run("ai_engine.main:app", host=config.HOST, port=config.PORT, reload=True)
