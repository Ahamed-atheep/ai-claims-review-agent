import uuid
from pathlib import Path
from uuid import uuid4

from app.core.config import settings


class StorageService:
    """Handles saving and retrieving uploaded files."""

    def __init__(self) -> None:
        self._upload_dir = Path(settings.UPLOAD_DIR)
        self._upload_dir.mkdir(parents=True, exist_ok=True)
        self._upload_root = self._upload_dir.resolve()

    def save(self, original_filename: str, file_bytes: bytes) -> tuple[str, str]:
        """Persist file bytes and return (file_id, stored_path)."""
        file_id = uuid.uuid4().hex
        safe_filename = Path(original_filename).name.replace("/", "_").replace("\\", "_")
        stored_name = f"{file_id}_{safe_filename}"
        dest = self._upload_dir / stored_name
        dest.write_bytes(file_bytes)
        return file_id, str(dest)

    def resolve_owned_path(self, stored_path: str) -> Path:
        """Return a resolved path only when it is inside the upload directory."""
        path = Path(stored_path).resolve()
        path.relative_to(self._upload_root)
        return path

    def stage_for_delete(self, stored_path: str) -> tuple[Path, Path] | None:
        """Move a stored upload aside so it can be restored if DB deletion fails."""
        source = self.resolve_owned_path(stored_path)
        if not source.exists():
            return None
        staged = source.with_name(f".delete-{uuid4().hex}-{source.name}")
        source.rename(staged)
        return source, staged

    def restore_staged_delete(self, original: Path, staged: Path) -> None:
        if staged.exists() and not original.exists():
            staged.rename(original)

    def finalize_staged_delete(self, staged: Path) -> None:
        if staged.exists():
            staged.unlink()
