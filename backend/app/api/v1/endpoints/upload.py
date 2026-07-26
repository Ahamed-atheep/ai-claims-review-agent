from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.upload import UploadResponse
from app.services.storage_service import StorageService

router = APIRouter()

_MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def get_storage_service() -> StorageService:
    return StorageService()


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED, tags=["Upload"])
async def upload_document(
    file: UploadFile,
    storage: StorageService = Depends(get_storage_service),
) -> UploadResponse:
    """Accept a single PDF upload, validate it, and persist it to disk."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .pdf files are accepted.")

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    if len(file_bytes) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    file_id, stored_path = storage.save(file.filename, file_bytes)

    return UploadResponse(
        success=True,
        file_id=file_id,
        filename=file.filename,
        stored_path=stored_path,
        message="File uploaded successfully.",
    )
