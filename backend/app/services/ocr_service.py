import logging
import os
import re
import shutil
from io import BytesIO
from pathlib import Path

from dotenv import load_dotenv
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, UnidentifiedImageError


logger = logging.getLogger(__name__)
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
OCR_CONFIGS = ["--oem 3 --psm 6", "--oem 3 --psm 11", "--oem 3 --psm 12"]
COMMON_TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
DEBUG_DIR = BACKEND_DIR / "debug"
LAST_OCR_TEXT_PATH = DEBUG_DIR / "last_ocr_text.txt"

PAYMENT_KEYWORDS = [
    "paid to",
    "payment details",
    "transaction id",
    "phonepe transaction id",
    "utr",
    "debited from",
    "credited to",
    "payment successful",
    "transaction successful",
    "paid",
    "phonepe",
    "gpay",
    "google pay",
    "paytm",
    "upi",
    "rs",
    "\u20b9",
    "amount",
    "support",
]
UPI_ID_PATTERN = re.compile(r"\b[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}\b")
UTR_PATTERN = re.compile(r"\bUTR[:\s]*[0-9]{6,}\b", re.IGNORECASE)
AMOUNT_PATTERN = re.compile(r"(\u20b9|rs\.?|inr)\s*\d+", re.IGNORECASE)
LONG_TRANSACTION_PATTERN = re.compile(r"\b[A-Z]{0,4}\d{10,}\b", re.IGNORECASE)

EMPTY_OCR_SUGGESTIONS = [
    "Check OCR health at /api/analyze/ocr-health",
    "Upload original screenshot instead of compressed image",
    "Crop image around transaction/message text",
    "Paste visible text manually",
]


def configure_tesseract():
    import pytesseract

    env_path = os.getenv("TESSERACT_CMD")
    if env_path and os.path.exists(env_path):
        pytesseract.pytesseract.tesseract_cmd = env_path
        return env_path

    if os.path.exists(COMMON_TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = COMMON_TESSERACT_PATH
        return COMMON_TESSERACT_PATH

    system_path = shutil.which("tesseract")
    if system_path:
        pytesseract.pytesseract.tesseract_cmd = system_path
        return system_path

    return None


def get_ocr_health() -> dict:
    try:
        import pytesseract
    except Exception as exc:
        return {
            "tesseract_available": False,
            "tesseract_cmd": None,
            "error": f"pytesseract import failed: {exc}",
            "fix": "Install Tesseract OCR and set TESSERACT_CMD in backend/.env",
        }

    path = configure_tesseract()
    if not path:
        return {
            "tesseract_available": False,
            "tesseract_cmd": None,
            "error": "Tesseract OCR is not installed or path is not configured",
            "fix": "Install Tesseract OCR and set TESSERACT_CMD in backend/.env",
        }

    try:
        version = str(pytesseract.get_tesseract_version())
        return {
            "tesseract_available": True,
            "tesseract_cmd": path,
            "tesseract_version": version,
            "message": "OCR engine is ready",
        }
    except Exception as exc:
        return {
            "tesseract_available": False,
            "tesseract_cmd": path,
            "error": str(exc),
            "fix": "Install Tesseract OCR and set TESSERACT_CMD in backend/.env",
        }


def _clean_text(text: str) -> str:
    cleaned = re.sub(r"[ \t]+", " ", text or "")
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def is_useful_ocr_text(text: str) -> bool:
    if not text:
        return False

    clean = _clean_text(text)
    lower = clean.lower()

    if len(clean) >= 30:
        return True

    count = sum(1 for keyword in PAYMENT_KEYWORDS if keyword in lower)
    if count >= 2:
        return True

    if UPI_ID_PATTERN.search(clean):
        return True
    if UTR_PATTERN.search(clean):
        return True
    if AMOUNT_PATTERN.search(clean):
        return True

    return False


def score_ocr_text(text: str) -> float:
    clean = _clean_text(text)
    lower = clean.lower()
    score = min(len(clean) / 10, 50)

    if "transaction id" in lower:
        score += 25
    if "utr" in lower:
        score += 25
    if "paid to" in lower:
        score += 20
    if "debited from" in lower:
        score += 20
    if any(word in lower for word in ["phonepe", "gpay", "google pay", "paytm"]):
        score += 20
    if "\u20b9" in clean or re.search(r"\brs\.?\s*\d+", lower):
        score += 15
    if UPI_ID_PATTERN.search(clean):
        score += 25
    if "payment successful" in lower or "transaction successful" in lower:
        score += 25
    if LONG_TRANSACTION_PATTERN.search(clean):
        score += 15

    return score


def _open_image(image_bytes: bytes) -> Image.Image:
    image = Image.open(BytesIO(image_bytes))
    image.load()
    return image.convert("RGB")


def _save_debug_text(text: str) -> None:
    try:
        DEBUG_DIR.mkdir(parents=True, exist_ok=True)
        LAST_OCR_TEXT_PATH.write_text(text, encoding="utf-8")
    except Exception as exc:
        logger.warning("Could not write OCR debug text file: %s", exc)


def _pil_variants(image: Image.Image) -> list[tuple[str, Image.Image]]:
    upscaled_2x = image.resize((image.width * 2, image.height * 2), Image.Resampling.LANCZOS)
    upscaled_3x = image.resize((image.width * 3, image.height * 3), Image.Resampling.LANCZOS)
    variants: list[tuple[str, Image.Image]] = [
        ("original", image),
        ("upscaled", upscaled_2x),
        ("upscaled_3x", upscaled_3x),
    ]

    grayscale = ImageOps.grayscale(upscaled_2x)
    contrasted = ImageEnhance.Contrast(grayscale).enhance(2.2)
    sharpened = contrasted.filter(ImageFilter.SHARPEN)
    threshold = sharpened.point(lambda pixel: 255 if pixel > 150 else 0)
    inverted = ImageOps.invert(threshold)
    variants.extend(
        [
            ("grayscale", grayscale),
            ("contrast", contrasted),
            ("sharpened", sharpened),
            ("threshold", threshold),
            ("inverted", inverted),
        ]
    )
    return variants


def _opencv_variants(image: Image.Image) -> list[tuple[str, Image.Image]]:
    try:
        import cv2
        import numpy as np
    except Exception:
        return []

    rgb = np.array(image)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    resized = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    denoised = cv2.fastNlMeansDenoising(resized, None, 15, 7, 21)
    adaptive = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 9)
    inverted = cv2.bitwise_not(adaptive)
    return [
        ("opencv_denoised", Image.fromarray(denoised)),
        ("opencv_adaptive", Image.fromarray(adaptive)),
        ("opencv_inverted", Image.fromarray(inverted)),
    ]


def _run_tesseract(image: Image.Image) -> tuple[str, str, str | None]:
    health = get_ocr_health()
    if not health.get("tesseract_available"):
        return "", "tesseract_unavailable", health.get("error")

    import pytesseract

    results: list[tuple[str, str]] = []
    variants = _pil_variants(image) + _opencv_variants(image)
    for variant_name, variant in variants:
        for config in OCR_CONFIGS:
            try:
                text = _clean_text(pytesseract.image_to_string(variant, config=config))
                if is_useful_ocr_text(text):
                    results.append((text, f"tesseract_{variant_name}"))
            except Exception as exc:
                logger.warning("Tesseract OCR failed variant=%s config=%s error=%s", variant_name, config, exc)

    if not results:
        return "", "tesseract_no_text", "Tesseract ran but did not produce useful OCR text"
    text, method = max(results, key=lambda item: score_ocr_text(item[0]))
    return text, method, None


def _failure(message: str, error: str | None = None, image_size: tuple[int, int] | None = None) -> dict:
    _save_debug_text("")
    width, height = image_size or (None, None)
    return {
        "success": False,
        "ocr_text": "",
        "ocr_method": None,
        "image_width": width,
        "image_height": height,
        "message": message,
        "suggestions": EMPTY_OCR_SUGGESTIONS,
        "error": error,
    }


def extract_text_from_image(image_bytes: bytes) -> dict:
    try:
        image = _open_image(image_bytes)
    except UnidentifiedImageError:
        return _failure("Could not open this image file.", "Invalid or unsupported image file")
    except Exception as exc:
        logger.exception("Could not read uploaded image bytes")
        return _failure("Could not read this image file.", str(exc))

    text, method, error = _run_tesseract(image)
    text = _clean_text(text)

    print("OCR text length:", len(text))
    print("OCR text preview:", text[:500])
    print("OCR method:", method)
    logger.info("OCR completed method=%s text_length=%s", method, len(text))
    _save_debug_text(text)

    if not is_useful_ocr_text(text):
        return _failure("Could not read text clearly from this image.", error or "No useful OCR text extracted", image.size)

    return {
        "success": True,
        "ocr_text": text,
        "ocr_method": method,
        "image_width": image.width,
        "image_height": image.height,
        "message": "OCR text extracted successfully.",
        "suggestions": [],
        "error": None,
    }
