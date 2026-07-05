from fastapi import APIRouter, Depends, status

from app.database import get_collection
from app.models.report_model import ReportCreate
from app.services.auth_service import get_current_user
from app.utils.helpers import serialize_docs, utc_now


router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_report(payload: ReportCreate, current_user: dict = Depends(get_current_user)):
    await get_collection("reports").insert_one({**payload.model_dump(), "user_id": current_user["id"], "created_at": utc_now()})
    return {"message": "Scam report submitted successfully"}


@router.get("/my")
async def my_reports(current_user: dict = Depends(get_current_user)):
    cursor = get_collection("reports").find({"user_id": current_user["id"]}).sort("created_at", -1)
    return serialize_docs(await cursor.to_list(length=100))
