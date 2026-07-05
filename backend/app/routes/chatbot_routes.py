from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.services.chatbot_service import answer_question


router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


class ChatbotRequest(BaseModel):
    question: str = Field(..., min_length=2)
    last_analysis: dict | None = None


@router.post("/ask")
async def ask(payload: ChatbotRequest):
    return answer_question(payload.question, payload.last_analysis)
