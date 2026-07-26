class OCRService:
    """Fallback OCR using EasyOCR for scanned/image-based PDFs."""

    def extract_text(self, image_bytes: bytes) -> str:
        """Extract text from image bytes via OCR. To be implemented."""
        raise NotImplementedError
