from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_collection
from app.services.auth_service import require_roles

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/recent-activities")
async def get_recent_activities(current_user: dict = Depends(require_roles(["admin"]))):
    audit_col = get_collection("audit_logs")
    return await audit_col.find({}, sort=[("timestamp", -1)], limit=20)
