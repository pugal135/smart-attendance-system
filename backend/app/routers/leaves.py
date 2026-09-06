from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import List, Optional
from app.database import get_collection
from app.models.leave import LeaveApply, LeaveReview, AbsenceExplanationRequest, AbsenceExplanationSubmit, AbsenceExplanationReview
from app.services.auth_service import require_roles, get_current_user
from app.services.notification_service import create_notification
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/leaves", tags=["Leaves & Absences"])

@router.post("/apply")
async def apply_leave(
    data: LeaveApply,
    current_user: dict = Depends(require_roles(["student"]))
):
    students_col = get_collection("students")
    classes_col = get_collection("classes")
    leaves_col = get_collection("leave_requests")
    
    student = await students_col.find_one({"user_id": current_user["_id"]})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    class_doc = await classes_col.find_one({"_id": student.get("class_id")})
    class_name = class_doc.get("name") if class_doc else ""
    
    doc = {
        "student_id": student["_id"],
        "student_name": student.get("name"),
        "register_number": student.get("register_number"),
        "class_id": student.get("class_id"),
        "class_name": class_name,
        "from_date": data.from_date,
        "to_date": data.to_date,
        "reason": data.reason,
        "attachment_url": data.attachment_url,
        "status": "PENDING",
        "created_at": datetime.utcnow().isoformat()
    }
    res = await leaves_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    return {"message": "Leave application submitted successfully for tutor review", "leave": doc}

@router.get("")
async def list_leaves(
    status_filter: Optional[str] = None,
    class_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    leaves_col = get_collection("leave_requests")
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
    else:
        if class_id:
            query["class_id"] = class_id
            
    if status_filter:
        query["status"] = status_filter.upper()
        
    return await leaves_col.find(query, sort=[("created_at", -1)])

@router.patch("/{leave_id}/review")
async def review_leave(
    leave_id: str,
    review: LeaveReview,
    current_user: dict = Depends(require_roles(["tutor", "admin"]))
):
    leaves_col = get_collection("leave_requests")
    att_col = get_collection("attendance")
    students_col = get_collection("students")
    
    leave = await leaves_col.find_one({"_id": leave_id})
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    new_status = review.status.upper()
    now_str = datetime.utcnow().isoformat()
    
    await leaves_col.update_one(
        {"_id": leave_id},
        {"$set": {
            "status": new_status,
            "reviewed_by": current_user["_id"],
            "reviewer_name": current_user["name"],
            "reviewed_at": now_str,
            "review_remarks": review.remarks
        }}
    )
    
    # If approved, update existing attendance records within this date range to APPROVED_LEAVE
    if new_status == "APPROVED":
        await att_col.update_many(
            {
                "student_id": leave["student_id"],
                "date": {"$gte": leave["from_date"], "$lte": leave["to_date"]},
                "status": {"$in": ["ABSENT", "UNINFORMED_ABSENCE"]}
            },
            {"$set": {"status": "APPROVED_LEAVE", "modification_reason": f"Leave approved by {current_user['name']}"}}
        )
        
    # Notify Student
    st = await students_col.find_one({"_id": leave["student_id"]})
    if st:
        await create_notification(
            user_id=st["user_id"],
            title=f"Leave Request {new_status}",
            message=f"Your leave request for {leave['from_date']} to {leave['to_date']} was {new_status.lower()} by {current_user['name']}.",
            notif_type="LEAVE_STATUS",
            meta_data={"leave_id": leave_id, "status": new_status}
        )
        
    await record_audit_log(
        actor_id=current_user["_id"],
        actor_name=current_user["name"],
        actor_role=current_user["role"],
        action_type="LEAVE_REVIEW",
        entity_name="leave_requests",
        entity_id=leave_id,
        details=f"Leave {new_status}. Remarks: {review.remarks}"
    )
    return {"message": f"Leave request {new_status} successfully"}
