from fastapi import APIRouter

from app.api.v1.endpoints import analyze, health, upload

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(upload.router)
api_router.include_router(analyze.router)
