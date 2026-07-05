from fastapi import APIRouter, Depends, status

from app.database import get_collection
from app.models.feedback_model import FeedbackCreate
from app.services.auth_service import get_current_user
from app.utils.helpers import utc_now


router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_feedback(payload: FeedbackCreate, current_user: dict = Depends(get_current_user)):
    await get_collection("feedback").insert_one({**payload.model_dump(), "user_id": current_user["id"], "created_at": utc_now()})
    return {"message": "Feedback submitted successfully"}
