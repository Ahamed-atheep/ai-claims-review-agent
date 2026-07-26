from fastapi import APIRouter

from app.api.v1.endpoints import analyze, claims, documents, health

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(claims.router)
api_router.include_router(documents.router)
api_router.include_router(analyze.router)
