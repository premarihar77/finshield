import sys
from pathlib import Path

from app.services.ocr_service import extract_text_from_image, get_ocr_health


def main() -> None:
    if len(sys.argv) != 2:
        print('Usage: python test_ocr_local.py "path/to/image.jpeg"')
        raise SystemExit(1)

    image_path = Path(sys.argv[1])
    if not image_path.exists():
        print(f"Image not found: {image_path}")
        raise SystemExit(1)

    print("OCR health:")
    print(get_ocr_health())

    result = extract_text_from_image(image_path.read_bytes())
    print("Image size:", result.get("image_width"), "x", result.get("image_height"))
    print("OCR method:", result.get("ocr_method"))
    print("OCR text length:", len(result.get("ocr_text") or ""))
    print("OCR text:")
    print(result.get("ocr_text") or "")
    if result.get("error"):
        print("Error:", result["error"])


if __name__ == "__main__":
    main()
