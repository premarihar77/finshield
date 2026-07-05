import re
from urllib.parse import urlparse


URL_PATTERN = re.compile(r"https?://[^\s,]+|www\.[^\s,]+", re.IGNORECASE)
UPI_PATTERN = re.compile(r"\b[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}[a-zA-Z0-9]*\b")

SHORTENERS = {"bit.ly", "tinyurl.com", "cutt.ly", "is.gd", "t.co", "goo.gl", "ow.ly", "shorturl.at", "rb.gy", "shorturl"}
SUSPICIOUS_WORDS = [
    "kyc",
    "verify",
    "reward",
    "claim",
    "free",
    "cashback",
    "bank-support",
    "upi-help",
    "urgent",
    "update",
]
FAKE_BANK_PATTERNS = ["sbi-verify", "hdfc-kyc", "axis-support", "icici-update", "bank-kyc"]
SUSPICIOUS_TLDS = {".xyz", ".top", ".click", ".work", ".support", ".loan"}
UPI_SUSPICIOUS_WORDS = [
    "kyc",
    "refund",
    "cashback",
    "reward",
    "verify",
    "support",
    "customer",
    "claim",
    "security",
    "deposit",
    "urgent",
    "helpdesk",
]


def extract_urls(text: str) -> list[str]:
    return sorted({match.rstrip(").]") for match in URL_PATTERN.findall(text or "")})


def extract_upi_ids(text: str) -> list[str]:
    return sorted({match for match in UPI_PATTERN.findall(text or "")})


def _risk_from_points(points: int) -> str:
    if points >= 60:
        return "High Risk"
    if points >= 30:
        return "Suspicious"
    return "Low Risk"


def risk_points_to_score(risk: str) -> int:
    if risk == "High Risk":
        return 80
    if risk == "Suspicious":
        return 55
    if risk == "Low Risk":
        return 20
    return 0


def analyze_url(url: str) -> dict:
    normalized = url if url.startswith(("http://", "https://")) else f"https://{url}"
    parsed = urlparse(normalized)
    domain = parsed.netloc.lower().replace("www.", "")
    reasons: list[str] = []
    points = 0

    if normalized.lower().startswith("http://"):
        points += 25
        reasons.append("Uses HTTP instead of HTTPS")
    if domain in SHORTENERS:
        points += 25
        reasons.append("Uses a URL shortener")
    if any(word in domain for word in SUSPICIOUS_WORDS):
        points += 25
        reasons.append("Contains KYC, verify, reward, claim, or urgent wording")
    if any(pattern in domain for pattern in FAKE_BANK_PATTERNS):
        points += 30
        reasons.append("Looks like a fake bank support or KYC domain")
    if domain.count("-") >= 2:
        points += 15
        reasons.append("Domain has too many hyphens")
    if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
        points += 15
        reasons.append("Uses a suspicious top-level domain")

    return {
        "url": url,
        "risk": _risk_from_points(points),
        "risk_score": min(100, points),
        "reasons": reasons or ["No strong URL warning indicators found"],
    }


def analyze_upi_id(upi_id: str) -> dict:
    lowered = upi_id.lower()
    reasons: list[str] = []
    points = 0

    for word in UPI_SUSPICIOUS_WORDS:
        if word in lowered:
            points += 20
            reasons.append(f"Contains suspicious UPI keyword: {word}")

    if "verify" in lowered or "kyc" in lowered:
        points += 20
        reasons.append("Looks like a verification or KYC scam handle")
    if len(upi_id.split("@", 1)[0]) > 24:
        points += 10
        reasons.append("UPI handle name is unusually long")

    return {
        "upi_id": upi_id,
        "risk": _risk_from_points(points),
        "risk_score": min(100, points),
        "reasons": reasons or ["No strong UPI ID warning indicators found"],
    }


def analyze_text_entities(text: str) -> dict:
    urls = extract_urls(text)
    upi_ids = extract_upi_ids(text)
    url_results = [analyze_url(url) for url in urls]
    upi_results = [analyze_upi_id(upi_id) for upi_id in upi_ids]
    url_upi_risk_score = max([0] + [item["risk_score"] for item in url_results + upi_results])
    return {
        "urls": url_results,
        "upi_ids": upi_results,
        "url_upi_risk_score": url_upi_risk_score,
    }
