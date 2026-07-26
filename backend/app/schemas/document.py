from typing import Literal

from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    success: bool
    claim_id: str
    document_id: str
    file_name: str
    page_count: int
    characters: int
    extraction_method: Literal["pymupdf", "easyocr"]
    ocr_used: bool
    storage_path: str
    message: str
