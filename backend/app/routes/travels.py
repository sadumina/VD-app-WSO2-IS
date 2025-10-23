from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.database import travels_collection
from app.auth import get_current_user, role_required
from bson import ObjectId

router = APIRouter()

# -------------------------
# Schemas
# -------------------------
class TravelLogRequest(BaseModel):
    meter_start: float
    meter_end: float
    official_km: float
    private_km: float
    remarks: Optional[str] = ""

# -------------------------
# Helper to fix MongoDB _id
# -------------------------
def fix_ids(doc):
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc

# -------------------------
# Employee: Add Travel Log
# -------------------------
@router.post("/")
async def add_travel(log: TravelLogRequest, user=Depends(get_current_user)):
    if log.meter_end < log.meter_start:
        raise HTTPException(status_code=400, detail="End reading must be >= start")

    total_km = log.meter_end - log.meter_start

    log_data = {
        "user_email": user["sub"],
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "meter_start": log.meter_start,
        "meter_end": log.meter_end,
        "official_km": log.official_km,
        "private_km": log.private_km,
        "total_km": total_km,
        "remarks": log.remarks,
        "created_at": datetime.utcnow()
    }
    result = await travels_collection.insert_one(log_data)
    return {"msg": "✅ Travel log added", "id": str(result.inserted_id)}

# -------------------------
# Employee: View My Logs
# -------------------------
@router.get("/me")
async def get_my_travels(user=Depends(get_current_user)):
    logs = await travels_collection.find({"user_email": user["sub"]}).to_list(500)
    return [fix_ids(log) for log in logs]

# -------------------------
# Admin: View All Logs
# -------------------------
@router.get("/all")
async def get_all_travels(user=Depends(role_required("admin"))):
    logs = await travels_collection.find().to_list(5000)
    return [fix_ids(log) for log in logs]
