import fitz  # PyMuPDF

from app.core.logging import logger

OCR_FALLBACK_THRESHOLD = 30  # characters — below this, trigger OCR


class PDFExtractionError(Exception):
    """Raised when PDF text extraction fails."""


class PDFExtractionService:
    """Extracts text and page images from PDF files using PyMuPDF."""

    def _open(self, file_path: str) -> fitz.Document:
        """Open a PDF document, raising typed exceptions on failure."""
        try:
            doc = fitz.open(file_path)
        except FileNotFoundError:
            raise FileNotFoundError(f"PDF not found: {file_path}")
        except Exception as exc:
            raise PDFExtractionError(f"Cannot open PDF '{file_path}': {exc}") from exc
        if doc.is_encrypted:
            raise PDFExtractionError(f"PDF is encrypted and cannot be processed: {file_path}")
        return doc

    def extract_text(self, file_path: str) -> tuple[str, int]:
        """Extract text from every page.

        Returns:
            (text, page_count) — text is stripped; may be empty for image-only PDFs.

        Raises:
            FileNotFoundError: File does not exist.
            PDFExtractionError: File is corrupted, encrypted, or unreadable.
        """
        doc = self._open(file_path)
        try:
            page_count = doc.page_count
            text = "".join(page.get_text() for page in doc).strip()
        except Exception as exc:
            raise PDFExtractionError(f"Text extraction failed for '{file_path}': {exc}") from exc
        finally:
            doc.close()

        logger.info("PyMuPDF | path=%s | pages=%d | chars=%d", file_path, page_count, len(text))
        return text, page_count

    def render_pages_as_png(self, file_path: str, dpi: int = 150) -> list[bytes]:
        """Render every page to a PNG bytes object (for OCR fallback).

        Args:
            file_path: Path to the PDF file.
            dpi: Rendering resolution. 150 dpi is sufficient for EasyOCR.

        Returns:
            List of PNG bytes, one per page, in page order.
        """
        doc = self._open(file_path)
        try:
            matrix = fitz.Matrix(dpi / 72, dpi / 72)
            images: list[bytes] = []
            for page in doc:
                pix = page.get_pixmap(matrix=matrix, colorspace=fitz.csRGB)
                images.append(pix.tobytes("png"))
        except Exception as exc:
            raise PDFExtractionError(f"Page rendering failed for '{file_path}': {exc}") from exc
        finally:
            doc.close()

        return images
