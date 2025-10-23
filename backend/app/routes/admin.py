from fastapi import APIRouter, Depends
from app.auth import role_required
from app.database import travels_collection

router = APIRouter()

@router.get("/all")
async def get_all_travels(admin=Depends(role_required("admin"))):
    logs = await travels_collection.find().to_list(1000)
    return logs
