from pydantic import BaseModel


class UploadResponse(BaseModel):
    success: bool
    file_id: str
    filename: str
    stored_path: str
    message: str
