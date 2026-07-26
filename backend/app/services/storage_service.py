import uuid
from pathlib import Path

from app.core.config import settings


class StorageService:
    """Handles saving and retrieving uploaded files."""

    def __init__(self) -> None:
        self._upload_dir = Path(settings.UPLOAD_DIR)
        self._upload_dir.mkdir(parents=True, exist_ok=True)

    def save(self, original_filename: str, file_bytes: bytes) -> tuple[str, str]:
        """Persist file bytes and return (file_id, stored_path)."""
        file_id = uuid.uuid4().hex
        stored_name = f"{file_id}_{original_filename}"
        dest = self._upload_dir / stored_name
        dest.write_bytes(file_bytes)
        return file_id, str(dest)
