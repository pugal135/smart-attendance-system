from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import List, Optional
from app.database import get_collection
from app.models.fine import ClearanceVerify, ClearanceResponse
from app.services.auth_service import require_roles, get_current_user
from app.services.notification_service import create_notification
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/clearance", tags=["Clearance Management"])

@router.get("")
async def list_clearances(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    clearance_col = get_collection("clearances")
    query = {}
    
    if current_user["role"] == "student":
        st = await get_collection("students").find_one({"user_id": current_user["_id"]})
        if not st:
            return []
        query["student_id"] = st["_id"]
    elif current_user["role"] == "parent":
        pa = await get_collection("parents").find_one({"user_id": current_user["_id"]})
        if not pa:
            return []
        wards = await get_collection("students").find({"parent_id": pa["_id"]})
        ward_ids = [w["_id"] for w in wards]
        query["student_id"] = {"$in": ward_ids}
        
    if status_filter:
        query["status"] = status_filter.upper()
        
    return await clearance_col.find(query, sort=[("created_at", -1)])

@router.patch("/{clearance_id}/verify")
async def verify_clearance(
    clearance_id: str,
    data: ClearanceVerify,
    current_user: dict = Depends(require_roles(["admin"]))
):
    clearance_col = get_collection("clearances")
    students_col = get_collection("students")
    
    clearance = await clearance_col.find_one({"_id": clearance_id})
    if not clearance:
        raise HTTPException(status_code=404, detail="Clearance record not found")
        
    now_str = datetime.utcnow().isoformat()
    await clearance_col.update_one(
        {"_id": clearance_id},
        {"$set": {
            "status": data.status,
            "verified_by": current_user["name"],
            "verified_at": now_str,
            "remarks": data.remarks or "Official university clearance verified."
        }}
    )
    
    # Notify Student
    st = await students_col.find_one({"_id": clearance["student_id"]})
    if st:
        await create_notification(
            user_id=st["user_id"],
            title=f"Clearance Status: {data.status.replace('_', ' ')}",
            message=f"Your clearance pass status is now '{data.status.replace('_', ' ')}'. Endorsed by {current_user['name']}.",
            notif_type="CLEARANCE_UPDATE",
            meta_data={"clearance_id": clearance_id, "status": data.status}
        )
        
    await record_audit_log(
        actor_id=current_user["_id"],
        actor_name=current_user["name"],
        actor_role=current_user["role"],
        action_type="CLEARANCE_VERIFY",
        entity_name="clearances",
        entity_id=clearance_id,
        details=f"Clearance updated to {data.status}. Remarks: {data.remarks}"
    )
    return {"message": "Clearance status updated successfully"}
