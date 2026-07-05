import re

from app.utils.regex_extractors import extract_entities, get_domain
from app.ml.scam_classifier import predict_scam_category
from app.services.url_upi_checker import analyze_text_entities


DISCLAIMER = (
    "FinShield provides risk-based awareness support only. "
    "Always verify through official bank channels."
)

CATEGORY_KEYWORDS = {
    "KYC Update Scam": ["kyc", "kyc expired", "kyc expire", "kyc will expire", "kyc update", "account blocked", "account blocking", "account suspend", "bank account suspended", "bank account band", "account band ho jayega", "verify now", "update your pan", "pan update", "aadhaar verification", "aadhaar verify", "account will be blocked"],
    "Reward / Lottery Scam": ["congratulations", "you won", "reward", "cashback", "lottery", "claim now", "free gift", "lucky winner", "prize"],
    "Digital Arrest / Police Scam": ["digital arrest", "police case", "cyber cell", "arrest warrant", "legal action", "money laundering", "investigation", "court case", "fir", "jail", "police verification"],
    "UPI PIN / OTP Scam": ["otp", "one time password", "verification code", "share otp", "enter otp", "upi pin", "share your pin", "share pin", "send pin", "pin batao", "otp batao", "apna otp bhejo", "upi pin dalo"],
    "Urgency / Fear": ["urgent", "immediately", "within 24 hours", "last warning", "final notice", "account will be blocked", "today only"],
    "Suspicious Payment": ["pay now", "send money", "transfer amount", "processing fee", "refundable fee", "registration fee", "security deposit", "pay rs", "pay ₹", "payment required", "transfer rs", "send rs"],
    "Remote Access Scam": ["anydesk", "quicksupport", "teamviewer", "screen share", "share screen", "remote access", "install app", "customer support app"],
    "Fake Payment Proof / Suspicious Transaction": ["fake payment", "payment proof", "fake utr", "edited screenshot", "screenshot", "utr mismatch", "money not credited"],
}

SHORTENERS = {"bit.ly", "tinyurl.com", "cutt.ly", "is.gd", "t.co", "goo.gl", "ow.ly"}
SUSPICIOUS_DOMAIN_WORDS = ["kyc", "reward", "free", "verify", "claim", "bank-support", "upi-help", "cashback", "customer-care"]
BANK_WORDS = ["sbi", "hdfc", "icici", "axis", "kotak", "pnb", "bob", "paytm", "phonepe", "gpay", "upi"]
OFFICIAL_DOMAINS = ["sbi.co.in", "hdfcbank.com", "icicibank.com", "axisbank.com", "kotak.com", "npci.org.in"]
SAFE_PAYMENT_INDICATORS = [
    "transaction successful",
    "payment successful",
    "paid to",
    "debited from",
    "credited to",
    "transaction id",
    "utr",
    "upi transaction id",
    "completed",
    "success",
]


def _contains_any(text: str, phrases: list[str]) -> bool:
    return any(phrase in text for phrase in phrases)


def _risk_level(score: int) -> str:
    if score <= 20:
        return "Safe"
    if score <= 40:
        return "Low Risk"
    if score <= 60:
        return "Suspicious"
    if score <= 80:
        return "High Risk"
    return "Critical"


def _decision(score: int) -> str:
    if score <= 20:
        return "This appears low risk, but verify payment and banking details only through official apps."
    if score <= 60:
        return "Treat this as suspicious. Do not share sensitive details and verify through official channels."
    return "Do not trust this message. Do not click links, pay, install apps, or share OTP/UPI PIN."


def _has_any(text: str, phrases: list[str]) -> bool:
    return any(phrase in text for phrase in phrases)


def _ml_risk_score(category: str, confidence: float, has_red_flags: bool) -> int:
    mapping = {
        "KYC Scam": 70,
        "Reward Scam": 65,
        "OTP/UPI PIN Scam": 90,
        "Digital Arrest Scam": 95,
        "Fake Customer Care Scam": 75,
        "Remote Access Scam": 90,
        "Suspicious Payment Request": 75,
        "Fake Payment Proof": 70,
    }
    if category == "Safe Message":
        return 50 if has_red_flags else 10
    return max(mapping.get(category, 60), round(confidence))


def _url_upi_score(url_upi_analysis: dict) -> int:
    return max(
        [url_upi_analysis.get("url_upi_risk_score", 0)]
        + [item.get("risk_score", 0) for item in url_upi_analysis.get("urls", [])]
        + [item.get("risk_score", 0) for item in url_upi_analysis.get("upi_ids", [])]
    )


def _apply_overrides(score: int, flags: dict[str, bool], signals: list[str]) -> int:
    minimum = 0
    if flags["otp_pin"]:
        minimum = max(minimum, 90)
        signals.append("UPI PIN or OTP sharing request detected")
    if flags["kyc"] and flags["url"]:
        minimum = max(minimum, 85)
        signals.append("KYC/account blocking threat with suspicious link detected")
    if flags["digital_arrest"]:
        minimum = max(minimum, 95)
        signals.append("Digital arrest or legal threat detected")
    if flags["remote_access"]:
        minimum = max(minimum, 90)
        signals.append("Remote access or screen sharing request detected")
    if flags["reward"] and (flags["otp_pin"] or flags["payment"]):
        minimum = max(minimum, 90)
        signals.append("Reward or cashback bait combined with sensitive/payment request detected")
    if flags["payment"] and flags["url"]:
        minimum = max(minimum, 80)
        signals.append("Payment request with suspicious link detected")
    if flags["suspicious_upi"] and flags["payment"]:
        minimum = max(minimum, 75)
        signals.append("Suspicious UPI ID with payment request detected")
    if flags["shortener"]:
        score += 25
        signals.append("URL shortener detected")
        if flags["payment"] or flags["kyc"]:
            minimum = max(minimum, 80)
    if flags["http_url"]:
        score += 20
        signals.append("HTTP link instead of HTTPS detected")
        if flags["kyc"] or flags["payment"] or flags["reward"]:
            minimum = max(minimum, 75)
    if any(flags.values()):
        minimum = max(minimum, 41)
    return min(100, max(score, minimum))


def _safe_allowed(score: int, flags: dict[str, bool]) -> bool:
    blocking_flags = ["url", "otp_pin", "kyc", "payment", "reward", "digital_arrest", "remote_access", "suspicious_upi"]
    return score <= 20 and not any(flags[key] for key in blocking_flags)


def _primary_category(matches: dict[str, int], entities: dict) -> str:
    if not matches:
        if entities["urls"]:
            return "Suspicious Link Scam"
        return "No Clear Scam Pattern"
    category = max(matches, key=matches.get)
    if category == "Suspicious Payment" and entities["upi_ids"]:
        return "Suspicious UPI Payment Request"
    return category


def _url_findings(urls: list[str]) -> tuple[int, list[str]]:
    score = 0
    signals: list[str] = []
    if urls:
        score += 15
        signals.append("URL detected")

    for url in urls:
        domain = get_domain(url)
        if url.lower().startswith("http://"):
            score += 25
            signals.append(f"Insecure HTTP link detected: {domain}")
        if domain in SHORTENERS:
            score += 25
            signals.append(f"URL shortener detected: {domain}")
        if any(word in domain for word in SUSPICIOUS_DOMAIN_WORDS):
            score += 25
            signals.append(f"Suspicious domain wording detected: {domain}")
        if any(bank in domain for bank in BANK_WORDS) and not any(domain.endswith(official) for official in OFFICIAL_DOMAINS):
            score += 25
            signals.append(f"Possible bank/UPI impersonation domain detected: {domain}")
    return score, signals


def analyze_text(input_text: str) -> dict:
    text = input_text.lower()
    entities = extract_entities(input_text)
    score = 0
    signals: list[str] = []
    category_matches: dict[str, int] = {}

    checks = [
        ("UPI PIN / OTP Scam", 35, "OTP or UPI PIN request detected"),
        ("KYC Update Scam", 30, "KYC or account blocking threat detected"),
        ("Urgency / Fear", 20, "Urgency or fear wording detected"),
        ("Suspicious Payment", 25, "Suspicious payment request detected"),
        ("Reward / Lottery Scam", 25, "Reward, lottery, or cashback bait detected"),
        ("Remote Access Scam", 35, "Remote access or screen sharing request detected"),
        ("Digital Arrest / Police Scam", 40, "Digital arrest, police, or legal threat detected"),
        ("Fake Payment Proof / Suspicious Transaction", 20, "Payment proof or transaction claim detected"),
    ]

    for category, weight, signal in checks:
        keywords = CATEGORY_KEYWORDS[category]
        matched_count = sum(1 for keyword in keywords if keyword in text)
        if matched_count:
            score += weight
            signals.append(signal)
            category_matches[category] = matched_count

    url_score, url_signals = _url_findings(entities["urls"])
    score += url_score
    signals.extend(url_signals)

    if len(entities["phone_numbers"]) > 1:
        score += 10
        signals.append("Multiple phone numbers detected")
    if entities["upi_ids"] and _contains_any(text, CATEGORY_KEYWORDS["Suspicious Payment"]):
        score += 20
        signals.append("UPI ID present with payment request")
    if entities["amounts"] and _contains_any(text, CATEGORY_KEYWORDS["Suspicious Payment"] + CATEGORY_KEYWORDS["Digital Arrest / Police Scam"]):
        signals.append("Money amount detected in a suspicious context")

    ml_result = predict_scam_category(input_text)
    url_upi_analysis = analyze_text_entities(input_text)
    suspicious_upi_words = ["kyc", "refund", "cashback", "reward", "verify", "support", "customer", "claim", "security", "deposit", "helpdesk", "urgent"]
    flags = {
        "url": bool(entities["urls"]),
        "http_url": any(url.lower().startswith("http://") for url in entities["urls"]),
        "shortener": any(get_domain(url) in SHORTENERS for url in entities["urls"]),
        "otp_pin": _has_any(text, CATEGORY_KEYWORDS["UPI PIN / OTP Scam"]),
        "kyc": _has_any(text, CATEGORY_KEYWORDS["KYC Update Scam"]),
        "payment": _has_any(text, CATEGORY_KEYWORDS["Suspicious Payment"]) or bool(re.search(r"\b(pay|send|transfer)\s*(rs|₹|\d)", text)),
        "reward": _has_any(text, CATEGORY_KEYWORDS["Reward / Lottery Scam"]),
        "digital_arrest": _has_any(text, CATEGORY_KEYWORDS["Digital Arrest / Police Scam"]),
        "remote_access": _has_any(text, CATEGORY_KEYWORDS["Remote Access Scam"]),
        "suspicious_upi": any(any(word in upi.lower() for word in suspicious_upi_words) for upi in entities["upi_ids"]),
    }

    if flags["kyc"]:
        signals.append("KYC/account blocking threat detected")
    if flags["payment"]:
        signals.append("Payment request detected")
    if flags["url"]:
        signals.append("Suspicious link detected")

    rule_based_score = min(score, 100)
    ml_risk_score = _ml_risk_score(ml_result["ml_predicted_category"], ml_result["ml_confidence"], any(flags.values()))
    url_upi_risk_score = _url_upi_score(url_upi_analysis)
    score = max(rule_based_score, ml_risk_score, url_upi_risk_score)
    score = _apply_overrides(score, flags, signals)
    if not _safe_allowed(score, flags) and score <= 20:
        score = 41
    trust_score = 100 - score
    level = _risk_level(score)
    category = _primary_category(category_matches, entities)
    ai_category = ml_result["ml_predicted_category"]
    if ai_category and ai_category != "Safe Message":
        category = ai_category
    should_report = score >= 61

    has_safe_payment_indicator = _has_any(text, SAFE_PAYMENT_INDICATORS)
    if score <= 20 and has_safe_payment_indicator and _safe_allowed(score, flags):
        category = "Payment Receipt"
        ai_category = "Payment Receipt"
        ml_result["ml_confidence"] = max(ml_result["ml_confidence"], 90)

    if score <= 20:
        if has_safe_payment_indicator:
            summary = "Payment screenshot or message appears normal based on readable text, with no strong scam indicators found."
            recommended_action = "Payment screenshot appears normal based on readable text, but always verify payment in your own bank/UPI app."
        else:
            summary = "No strong scam indicators were found, but you should still verify payment and banking messages through official channels."
            recommended_action = "Verify details in your official UPI or banking app before acting."
    elif score <= 60:
        summary = f"This content has warning signs linked to {category}. Review it carefully before clicking links or sending money."
        recommended_action = "Do not share sensitive details. Confirm the request using an official phone number or app."
    else:
        summary = f"This looks highly risky because it matches {category} patterns and contains multiple warning signals."
        recommended_action = "Do not click, pay, install apps, or share OTP/UPI PIN. Report it to your bank and the cybercrime portal if relevant."

    safety_tips = [
        "Never share OTP, UPI PIN, banking password, or card details.",
        "Banks do not ask users to verify KYC through random links.",
        "Do not install remote access apps for banking or UPI help.",
        "Use only official bank apps, NPCI resources, and verified customer care numbers.",
        "Report suspected fraud quickly through your bank and cybercrime.gov.in.",
    ]

    return {
        "risk_score": score,
        "trust_score": trust_score,
        "risk_level": level,
        "scam_category": category,
        "ml_predicted_category": ai_category,
        "ml_confidence": ml_result["ml_confidence"],
        "rule_based_score": rule_based_score,
        "ml_risk_score": ml_risk_score,
        "url_upi_risk_score": url_upi_risk_score,
        "final_risk_score": score,
        "summary": summary,
        "detected_signals": sorted(set(signals)) or ["No major warning signal detected"],
        "explanation": sorted(set(signals)) or ["No major warning signal detected"],
        "decision": _decision(score),
        "extracted_entities": entities,
        "url_upi_analysis": url_upi_analysis,
        "recommended_action": recommended_action,
        "safety_tips": safety_tips,
        "should_report": should_report,
        "disclaimer": DISCLAIMER,
    }
