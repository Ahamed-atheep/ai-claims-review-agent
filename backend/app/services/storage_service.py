class StorageService:
    """Handles saving and retrieving uploaded files."""

    def save(self, filename: str, file_bytes: bytes) -> str:
        """Persist file and return its stored path. To be implemented."""
        raise NotImplementedError

    def get_path(self, filename: str) -> str:
        """Return the full path for a stored file. To be implemented."""
        raise NotImplementedError
