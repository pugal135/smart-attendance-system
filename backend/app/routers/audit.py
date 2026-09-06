from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from app.database import get_collection
from app.services.auth_service import require_roles

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("")
async def get_audit_logs(
    action_type: Optional[str] = None,
    current_user: dict = Depends(require_roles(["admin"]))
):
    col = get_collection("audit_logs")
    query = {}
    if action_type:
        query["action_type"] = action_type
    return await col.find(query, sort=[("timestamp", -1)], limit=100)
