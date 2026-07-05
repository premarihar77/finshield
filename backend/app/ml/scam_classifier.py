from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.joblib"
VECTORIZER_PATH = BASE_DIR / "vectorizer.joblib"

FALLBACK_PATTERNS = [
    ("Digital Arrest Scam", ["digital arrest", "police", "cyber cell", "arrest", "legal action", "money laundering", "court case", "fir", "jail"]),
    ("Remote Access Scam", ["anydesk", "quicksupport", "teamviewer", "screen share", "share screen", "remote access", "install app"]),
    ("OTP/UPI PIN Scam", ["otp", "one time password", "upi pin", "pin share", "share pin", "send pin", "verification code", "otp batao", "pin batao"]),
    ("KYC Scam", ["kyc", "account blocked", "account block", "account suspend", "bank account band", "verify now", "aadhaar", "pan update"]),
    ("Reward Scam", ["congratulations", "reward", "cashback", "lottery", "winner", "free gift", "claim", "prize"]),
    ("Fake Customer Care Scam", ["customer care", "support number", "helpline", "refund support"]),
    ("Fake Payment Proof", ["fake payment", "payment proof", "screenshot", "fake utr", "edited", "money not credited"]),
    ("Suspicious Payment Request", ["pay now", "send money", "transfer", "deposit", "processing fee", "refundable fee"]),
]


def _fallback_predict(text: str) -> dict:
    lowered = text.lower()
    best_label = "Safe Message"
    best_hits = 0
    for label, keywords in FALLBACK_PATTERNS:
        hits = sum(1 for keyword in keywords if keyword in lowered)
        if hits > best_hits:
            best_label = label
            best_hits = hits

    confidence = 35.0 if best_label == "Safe Message" else min(88.0, 55.0 + best_hits * 12.0)
    return {"ml_predicted_category": best_label, "ml_confidence": round(confidence, 1)}


def predict_scam_category(text: str) -> dict:
    if not text or not text.strip():
        return {"ml_predicted_category": "Safe Message", "ml_confidence": 0.0}

    try:
        import joblib

        if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
            return _fallback_predict(text)

        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        vector = vectorizer.transform([text])
        label = model.predict(vector)[0]
        confidence = 0.0
        if hasattr(model, "predict_proba"):
            confidence = float(model.predict_proba(vector).max() * 100)
        return {"ml_predicted_category": label, "ml_confidence": round(confidence, 1)}
    except Exception:
        return _fallback_predict(text)
