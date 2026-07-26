ALLOWED_CONTENT_TYPES = {"application/pdf"}


def is_valid_pdf(content_type: str) -> bool:
    """Return True if the MIME type is an accepted PDF type."""
    return content_type in ALLOWED_CONTENT_TYPES
