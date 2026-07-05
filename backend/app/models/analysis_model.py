from typing import Literal

from pydantic import BaseModel, Field


class TextAnalysisRequest(BaseModel):
    input_text: str = Field(..., min_length=3)
    source_type: Literal["sms", "whatsapp", "email", "upi_message", "screenshot_ocr", "other"] = "other"


class ExtractedEntities(BaseModel):
    upi_ids: list[str] = []
    phone_numbers: list[str] = []
    urls: list[str] = []
    amounts: list[str] = []
    transaction_ids: list[str] = []


class AnalysisResponse(BaseModel):
    risk_score: int
    trust_score: int = 0
    risk_level: str
    scam_category: str
    ml_predicted_category: str = "Safe Message"
    ml_confidence: float = 0
    rule_based_score: int = 0
    ml_risk_score: int = 0
    url_upi_risk_score: int = 0
    final_risk_score: int = 0
    summary: str
    detected_signals: list[str]
    explanation: list[str] = []
    decision: str = ""
    extracted_entities: ExtractedEntities
    url_upi_analysis: dict = {}
    recommended_action: str
    safety_tips: list[str]
    should_report: bool
    disclaimer: str


class QuickScanRequest(BaseModel):
    input_text: str = Field(..., min_length=3)


class QuickScanResponse(BaseModel):
    risk_score: int
    trust_score: int = 0
    risk_level: str
    scam_category: str
    ml_predicted_category: str = "Safe Message"
    ml_confidence: float = 0
    rule_based_score: int = 0
    ml_risk_score: int = 0
    url_upi_risk_score: int = 0
    final_risk_score: int = 0
    summary: str
    detected_signals: list[str]
    explanation: list[str] = []
    decision: str = ""
    extracted_entities: ExtractedEntities
    url_upi_analysis: dict = {}
    recommended_action: str
    safety_tips: list[str]
    disclaimer: str = ""
