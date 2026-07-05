from fastapi import APIRouter, Depends

from app.database import get_collection
from app.services.auth_service import get_current_user
from app.utils.helpers import serialize_docs


router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


async def _count_group(user_id: str, field: str) -> list[dict]:
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    return await get_collection("analyses").aggregate(pipeline).to_list(length=100)


@router.get("/stats")
async def stats(current_user: dict = Depends(get_current_user)):
    analyses = get_collection("analyses")
    user_filter = {"user_id": current_user["id"]}
    total = await analyses.count_documents(user_filter)
    critical = await analyses.count_documents({**user_filter, "risk_level": "Critical"})
    high = await analyses.count_documents({**user_filter, "risk_level": "High Risk"})
    safe = await analyses.count_documents({**user_filter, "risk_level": "Safe"})
    categories = await _count_group(current_user["id"], "scam_category")
    ai_categories = await _count_group(current_user["id"], "ml_predicted_category")
    trust_rows = await analyses.aggregate(
        [
            {"$match": user_filter},
            {"$group": {"_id": None, "average_trust_score": {"$avg": "$trust_score"}}},
        ]
    ).to_list(length=1)
    return {
        "total_analyses": total,
        "critical_cases": critical,
        "high_risk_cases": high,
        "safe_cases": safe,
        "average_trust_score": round(trust_rows[0]["average_trust_score"], 1) if trust_rows else 0,
        "most_common_category": categories[0]["_id"] if categories else "No analyses yet",
        "most_common_ai_scam_type": ai_categories[0]["_id"] if ai_categories else "No analyses yet",
    }


@router.get("/recent")
async def recent(current_user: dict = Depends(get_current_user)):
    cursor = get_collection("analyses").find({"user_id": current_user["id"]}).sort("created_at", -1).limit(5)
    return serialize_docs(await cursor.to_list(length=5))


@router.get("/category-chart")
async def category_chart(current_user: dict = Depends(get_current_user)):
    rows = await _count_group(current_user["id"], "scam_category")
    return [{"name": row["_id"], "value": row["count"]} for row in rows]


@router.get("/risk-chart")
async def risk_chart(current_user: dict = Depends(get_current_user)):
    rows = await _count_group(current_user["id"], "risk_level")
    return [{"name": row["_id"], "value": row["count"]} for row in rows]


@router.get("/trust-trend")
async def trust_trend(current_user: dict = Depends(get_current_user)):
    cursor = get_collection("analyses").find({"user_id": current_user["id"]}).sort("created_at", 1).limit(20)
    rows = await cursor.to_list(length=20)
    return [
        {
            "name": row.get("created_at").strftime("%d %b") if row.get("created_at") else "Scan",
            "value": row.get("trust_score", 0),
        }
        for row in rows
    ]
