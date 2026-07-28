import io

import easyocr
import numpy as np
from PIL import Image

from app.core.logging import logger


class OCRError(Exception):
    """Raised when OCR processing fails."""


class OCRService:
    """Extracts text from page images using EasyOCR."""

    def __init__(self) -> None:
        # Initialise once; GPU auto-detected, falls back to CPU.
        # english only — extend languages list as needed.
        try:
            self._reader = easyocr.Reader(["en"], gpu=False, verbose=False)
        except Exception as exc:
            raise OCRError(f"Failed to initialise EasyOCR: {exc}") from exc

    def extract_text_from_images(self, page_images: list[bytes]) -> str:
        """Run OCR on a list of PNG page images and return combined text.

        Args:
            page_images: PNG bytes for each page, in page order.

        Returns:
            Single string with all pages concatenated, separated by newlines.

        Raises:
            OCRError: If OCR processing fails on any page.
        """
        if not page_images:
            return ""

        page_texts: list[str] = []
        for idx, png_bytes in enumerate(page_images, start=1):
            try:
                img_array = np.array(Image.open(io.BytesIO(png_bytes)).convert("RGB"))
                results = self._reader.readtext(img_array, detail=0, paragraph=True)
                page_text = "\n".join(results)
                page_texts.append(page_text)
                logger.debug("OCR page %d | chars=%d", idx, len(page_text))
            except Exception as exc:
                raise OCRError(f"OCR failed on page {idx}: {exc}") from exc

        combined = "\n\n".join(page_texts).strip()
        logger.info("EasyOCR | pages=%d | total_chars=%d", len(page_images), len(combined))
        return combined
