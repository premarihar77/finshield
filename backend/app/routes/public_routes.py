from fastapi import APIRouter

from app.models.analysis_model import QuickScanRequest, QuickScanResponse
from app.services.fraud_detector import analyze_text


router = APIRouter(prefix="/api/public", tags=["Public"])


@router.post("/quick-scan", response_model=QuickScanResponse)
async def quick_scan(payload: QuickScanRequest):
    result = analyze_text(payload.input_text)
    return {
        "risk_score": result["risk_score"],
        "trust_score": result["trust_score"],
        "risk_level": result["risk_level"],
        "scam_category": result["scam_category"],
        "ml_predicted_category": result["ml_predicted_category"],
        "ml_confidence": result["ml_confidence"],
        "rule_based_score": result["rule_based_score"],
        "ml_risk_score": result["ml_risk_score"],
        "url_upi_risk_score": result["url_upi_risk_score"],
        "final_risk_score": result["final_risk_score"],
        "summary": result["summary"],
        "detected_signals": result["detected_signals"],
        "explanation": result["explanation"],
        "decision": result["decision"],
        "extracted_entities": result["extracted_entities"],
        "url_upi_analysis": result["url_upi_analysis"],
        "recommended_action": result["recommended_action"],
        "safety_tips": result["safety_tips"],
        "disclaimer": result["disclaimer"],
    }
