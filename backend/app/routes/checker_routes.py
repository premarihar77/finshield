from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.services.url_upi_checker import analyze_text_entities


router = APIRouter(prefix="/api/checker", tags=["Checker"])


class CheckerRequest(BaseModel):
    text: str = Field(..., min_length=2)


@router.post("")
async def check_url_upi(payload: CheckerRequest):
    result = analyze_text_entities(payload.text)
    has_risky = any(item["risk"] in {"Suspicious", "High Risk"} for item in result["urls"] + result["upi_ids"])
    return {
        **result,
        "advice": (
            "Do not open links or pay unknown UPI IDs. Verify through official bank channels."
            if has_risky
            else "No strong warning signs found, but verify payment requests through official apps."
        ),
        "disclaimer": "FinShield provides risk-based awareness support only. Always verify through official bank channels.",
    }
