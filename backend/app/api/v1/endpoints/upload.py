from fastapi import APIRouter, UploadFile

from app.schemas.upload import UploadResponse

router = APIRouter()


@router.post("/upload", response_model=UploadResponse, tags=["Upload"])
async def upload_document(file: UploadFile) -> UploadResponse:
    """Accept a PDF upload and return extracted text. To be implemented."""
    raise NotImplementedError
