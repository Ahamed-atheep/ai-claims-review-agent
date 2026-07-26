from pydantic import BaseModel


class UploadResponse(BaseModel):
    filename: str
    extracted_text: str
    message: str
