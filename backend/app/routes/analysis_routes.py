import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.database import get_collection
from app.models.analysis_model import AnalysisResponse, TextAnalysisRequest
from app.services.auth_service import get_current_user
from app.services.fraud_detector import analyze_text
from app.services.ocr_service import extract_text_from_image, get_ocr_health
from app.utils.helpers import serialize_docs, utc_now


router = APIRouter(prefix="/api/analyze", tags=["Analysis"])
logger = logging.getLogger(__name__)
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}

PAYMENT_RECEIPT_INDICATORS = [
    "transaction successful",
    "payment successful",
    "paid to",
    "phonepe transaction id",
    "transaction id",
    "utr",
    "debited from",
    "credited to",
    "phonepe",
    "gpay",
    "paytm",
]
PAYMENT_RECEIPT_SCAM_INDICATORS = [
    "otp",
    "upi pin",
    "kyc",
    "click",
    "http",
    "https",
    "reward",
    "cashback claim",
    "digital arrest",
    "anydesk",
    "quicksupport",
    "screen share",
    "processing fee",
    "verify now",
]


async def _save_analysis(user_id: str, source_type: str, input_text: str, result: dict, ocr_text: str | None = None) -> None:
    analyses = get_collection("analyses")
    await analyses.insert_one(
        {
            "user_id": user_id,
            "source_type": source_type,
            "input_text": input_text,
            "ocr_text": ocr_text,
            **result,
            "created_at": utc_now(),
        }
    )


def is_normal_payment_receipt(text: str) -> bool:
    lower = (text or "").lower()
    has_payment = any(indicator in lower for indicator in PAYMENT_RECEIPT_INDICATORS)
    has_scam = any(indicator in lower for indicator in PAYMENT_RECEIPT_SCAM_INDICATORS)
    return has_payment and not has_scam


def payment_receipt_result(base_result: dict) -> dict:
    return {
        **base_result,
        "risk_score": 10,
        "trust_score": 90,
        "risk_level": "Safe",
        "scam_category": "Payment Receipt",
        "ml_predicted_category": "Payment Receipt",
        "ml_confidence": 90,
        "rule_based_score": min(base_result.get("rule_based_score", 0), 10),
        "ml_risk_score": 10,
        "url_upi_risk_score": min(base_result.get("url_upi_risk_score", 0), 10),
        "final_risk_score": 10,
        "summary": "This appears to be a normal payment receipt based on the readable screenshot text.",
        "detected_signals": [
            "Payment receipt indicators detected",
            "No strong scam indicators found in readable text",
        ],
        "explanation": [
            "Payment receipt indicators detected",
            "No strong scam indicators found in readable text",
        ],
        "decision": "Verify payment status inside your own official UPI or bank app before relying on the screenshot.",
        "recommended_action": "Payment screenshot appears normal based on readable text, but always verify payment status inside your own official UPI or bank app.",
        "safety_tips": [
            "Do not trust screenshots alone for high-value payments.",
            "Always verify received payments in your own UPI or bank app.",
            "Never share OTP or UPI PIN with anyone.",
        ],
        "should_report": False,
    }


@router.post("/text", response_model=AnalysisResponse)
async def analyze_text_route(payload: TextAnalysisRequest, current_user: dict = Depends(get_current_user)):
    result = analyze_text(payload.input_text)
    await _save_analysis(current_user["id"], payload.source_type, payload.input_text, result)
    return result


@router.get("/ocr-health")
async def ocr_health():
    return get_ocr_health()


@router.post("/image-debug")
async def analyze_image_debug(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, PNG, and WEBP images are supported",
        )

    contents = await file.read()
    ocr_health_info = get_ocr_health()
    if not ocr_health_info.get("tesseract_available"):
        return {
            "success": False,
            "filename": file.filename,
            "content_type": file.content_type,
            "image_width": None,
            "image_height": None,
            "tesseract_available": False,
            "tesseract_cmd": ocr_health_info.get("tesseract_cmd"),
            "ocr_method": None,
            "ocr_text_length": 0,
            "raw_ocr_text": "",
            "error": ocr_health_info.get("error"),
            "fix": ocr_health_info.get("fix"),
        }

    ocr_result = extract_text_from_image(contents)
    return {
        "success": bool(ocr_result.get("success")),
        "filename": file.filename,
        "content_type": file.content_type,
        "image_width": ocr_result.get("image_width"),
        "image_height": ocr_result.get("image_height"),
        "tesseract_available": ocr_health_info.get("tesseract_available", False),
        "tesseract_cmd": ocr_health_info.get("tesseract_cmd"),
        "ocr_method": ocr_result.get("ocr_method"),
        "ocr_text_length": len(ocr_result.get("ocr_text") or ""),
        "raw_ocr_text": ocr_result.get("ocr_text") or "",
        "error": ocr_result.get("error") or ocr_health_info.get("error"),
    }


@router.post("/image")
async def analyze_image_route(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, PNG, and WEBP images are supported",
        )

    contents = await file.read()
    print("Uploaded file:", file.filename)
    print("Content type:", file.content_type)
    logger.info("Image upload received name=%s type=%s bytes=%s", file.filename, file.content_type, len(contents))

    ocr_health_info = get_ocr_health()
    if not ocr_health_info.get("tesseract_available"):
        return {
            "success": False,
            "message": "OCR engine is not installed or configured.",
            "ocr_text": "",
            "suggestions": [
                "Install Tesseract OCR",
                "Set TESSERACT_CMD in backend/.env",
                "Restart backend server",
                "Use manual text input until OCR is configured",
            ],
            "debug_hint": ocr_health_info.get("error"),
            "fix": ocr_health_info.get("fix"),
        }

    ocr_result = extract_text_from_image(contents)
    if not ocr_result["success"]:
        return {
            "success": False,
            "message": "Could not read text clearly from this image.",
            "ocr_text": "",
            "suggestions": [
                "Check OCR health at /api/analyze/ocr-health",
                "Upload original screenshot instead of compressed image",
                "Crop image around transaction/message text",
                "Paste visible text manually",
            ],
            "debug_hint": ocr_result.get("error"),
        }

    ocr_text = ocr_result["ocr_text"]
    print("OCR text length:", len(ocr_text))
    print("OCR text preview:", ocr_text[:500])
    print("OCR method:", ocr_result.get("ocr_method"))
    result = analyze_text(ocr_text)
    if is_normal_payment_receipt(ocr_text):
        result = payment_receipt_result(result)
    await _save_analysis(current_user["id"], "image", ocr_text, result, ocr_text=ocr_text)
    return {"success": True, "ocr_text": ocr_text, "ocr_method": ocr_result.get("ocr_method"), **result}


@router.get("/history")
async def history(current_user: dict = Depends(get_current_user)):
    cursor = get_collection("analyses").find({"user_id": current_user["id"]}).sort("created_at", -1)
    return serialize_docs(await cursor.to_list(length=100))
