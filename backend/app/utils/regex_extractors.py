import re
from urllib.parse import urlparse


UPI_PATTERN = re.compile(r"\b[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}\b")
PHONE_PATTERN = re.compile(r"(?:(?:\+91[\-\s]?)|0)?[6-9]\d{9}\b")
URL_PATTERN = re.compile(r"\bhttps?://[^\s<>'\"]+|\b(?:www\.)[^\s<>'\"]+", re.IGNORECASE)
AMOUNT_PATTERN = re.compile(r"(?:₹\s?\d+(?:,\d{3})*(?:\.\d+)?|Rs\.?\s?\d+(?:,\d{3})*(?:\.\d+)?|INR\s?\d+(?:,\d{3})*(?:\.\d+)?)", re.IGNORECASE)
TXN_PATTERN = re.compile(r"\b(?=[A-Z0-9]*\d)[A-Z0-9]{10,24}\b", re.IGNORECASE)


def extract_entities(text: str) -> dict:
    return {
        "upi_ids": sorted(set(UPI_PATTERN.findall(text))),
        "phone_numbers": sorted(set(PHONE_PATTERN.findall(text))),
        "urls": sorted(set(URL_PATTERN.findall(text))),
        "amounts": sorted(set(AMOUNT_PATTERN.findall(text))),
        "transaction_ids": sorted(set(TXN_PATTERN.findall(text))),
    }


def normalize_url(url: str) -> str:
    if url.lower().startswith("www."):
        return f"https://{url}"
    return url


def get_domain(url: str) -> str:
    parsed = urlparse(normalize_url(url))
    return parsed.netloc.lower().replace("www.", "")
