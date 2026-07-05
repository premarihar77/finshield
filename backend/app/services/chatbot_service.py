from app.services.chatbot_knowledge import DISCLAIMER, KNOWLEDGE


INTENT_KEYWORDS = {
    "risk_explanation": ["why risky", "why is this risky", "explain", "risk", "dangerous"],
    "what_to_do_now": ["what should i do", "clicked", "now", "action", "next"],
    "kyc_scam": ["kyc"],
    "reward_scam": ["reward", "cashback", "lottery", "gift"],
    "digital_arrest": ["digital arrest", "police", "arrest", "cyber cell"],
    "upi_pin_otp": ["otp", "upi pin", "pin"],
    "remote_access": ["anydesk", "remote", "screen share", "quicksupport"],
    "fake_payment_screenshot": ["screenshot", "payment proof", "utr", "fake payment"],
    "report_fraud": ["report", "money lost", "lost money", "fraud"],
    "privacy": ["privacy", "data", "store"],
    "how_finshield_works": ["how does finshield", "calculate", "works"],
    "trust_score": ["trust score", "score"],
    "emergency_steps": ["emergency", "scammed", "steps"],
}

SUGGESTED = [
    "What should I do now?",
    "How can I report this scam?",
    "Why should I not share UPI PIN?",
    "How does Trust Score work?",
]


def _detect_intent(question: str) -> str:
    lowered = question.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return intent
    return "fallback"


def _analysis_answer(last_analysis: dict) -> str:
    risk_level = last_analysis.get("risk_level", "unknown")
    risk_score = last_analysis.get("risk_score", "unknown")
    category = last_analysis.get("ml_predicted_category") or last_analysis.get("scam_category") or "unknown scam type"
    signals = last_analysis.get("detected_signals") or last_analysis.get("explanation") or []
    action = last_analysis.get("recommended_action") or last_analysis.get("decision") or KNOWLEDGE["what_to_do_now"]
    signal_text = ", ".join(signals[:4]) if signals else "multiple scam warning signs"
    return (
        f"This looks {risk_level} with a risk score of {risk_score}/100. "
        f"The likely scam type is {category}. Key warning signs: {signal_text}. {action}"
    )


def answer_question(question: str, last_analysis: dict | None = None) -> dict:
    intent = _detect_intent(question)
    if intent == "risk_explanation" and last_analysis:
        answer = _analysis_answer(last_analysis)
    else:
        answer = KNOWLEDGE.get(intent, KNOWLEDGE["fallback"])

    return {
        "answer": f"{answer}\n\n{DISCLAIMER}",
        "suggested_questions": SUGGESTED,
    }
