from app.database import get_collection
from app.utils.helpers import utc_now


SCAM_PATTERNS = [
    {"category": "KYC Update Scam", "description": "Fake KYC expiry, PAN update, or account blocking messages."},
    {"category": "Reward Scam", "description": "Lottery, cashback, lucky winner, or free gift bait."},
    {"category": "Digital Arrest Scam", "description": "Threats involving police, cyber cell, warrants, or legal action."},
    {"category": "UPI PIN Scam", "description": "Requests for OTP, UPI PIN, banking password, or verification codes."},
    {"category": "Fake Customer Care Scam", "description": "Fraudulent support numbers and refund assistance claims."},
    {"category": "Remote Access Scam", "description": "Requests to install AnyDesk, QuickSupport, or screen sharing tools."},
    {"category": "Fake Payment Proof", "description": "Suspicious payment screenshots or transaction confirmation claims."},
    {"category": "Suspicious Link Scam", "description": "Risky links used for credential theft or fake verification."},
]


async def seed_scam_patterns() -> None:
    collection = get_collection("scam_patterns")
    if await collection.count_documents({}) == 0:
        await collection.insert_many([{**pattern, "created_at": utc_now()} for pattern in SCAM_PATTERNS])
