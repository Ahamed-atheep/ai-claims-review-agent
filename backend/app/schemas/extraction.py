from typing import Literal

from pydantic import BaseModel


class ExtractionResponse(BaseModel):
    document_id: str
    page_count: int
    method: Literal["pymupdf", "easyocr"]
    characters: int
    ocr_used: bool
    success: bool
