from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import List, Optional
from app.database import get_collection
from app.models.attendance import AttendanceBatchSubmit, AttendanceRecordResponse
from app.services.auth_service import require_roles, get_current_user
from app.services.fine_engine import evaluate_and_generate_student_fine
from app.services.notification_service import create_notification
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/batch")
async def submit_batch_attendance(
    batch: AttendanceBatchSubmit,
    current_user: dict = Depends(require_roles(["tutor", "admin"]))
):
    att_col = get_collection("attendance")
    classes_col = get_collection("classes")
    subjects_col = get_collection("subjects")
    students_col = get_collection("students")
    leaves_col = get_collection("leave_requests")
    parents_col = get_collection("parents")
    
    # 1. Prevent duplicate submission for exact class + subject + date + period
    existing = await att_col.find_one({
        "class_id": batch.class_id,
        "subject_id": batch.subject_id,
        "date": batch.date,
        "period": batch.period
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Attendance already marked for this Class, Subject, Date ({batch.date}), and Period ({batch.period})."
        )
        
    class_doc = await classes_col.find_one({"_id": batch.class_id})
    subject_doc = await subjects_col.find_one({"_id": batch.subject_id})
    class_name = class_doc.get("name") if class_doc else ""
    subject_name = subject_doc.get("name") if subject_doc else ""
    
    now_str = datetime.utcnow().isoformat()
    inserted_records = []
    
    for entry in batch.entries:
        st = await students_col.find_one({"_id": entry.student_id})
        if not st:
            continue
            
        status_val = entry.status
        
        # Check if student has approved leave for this date
        approved_leave = await leaves_col.find_one({
            "student_id": entry.student_id,
            "status": "APPROVED",
            "from_date": {"$lte": batch.date},
            "to_date": {"$gte": batch.date}
        })
        if approved_leave:
            status_val = "APPROVED_LEAVE"
        elif status_val == "ABSENT":
            # If no approved leave, mark as UNINFORMED_ABSENCE
            status_val = "UNINFORMED_ABSENCE"
            
        doc = {
            "student_id": entry.student_id,
            "student_name": st.get("name"),
            "register_number": st.get("register_number"),
            "class_id": batch.class_id,
            "class_name": class_name,
            "subject_id": batch.subject_id,
            "subject_name": subject_name,
            "tutor_id": current_user["_id"],
            "tutor_name": current_user["name"],
            "date": batch.date,
            "period": batch.period,
            "status": status_val,
            "entry_mode": "MANUAL",
            "marked_at": now_str,
            "created_at": now_str
        }
        res = await att_col.insert_one(doc)
        doc["_id"] = res.inserted_id
        inserted_records.append(doc)
        
        # If student was absent, trigger notifications
        if status_val in ["ABSENT", "UNINFORMED_ABSENCE"]:
            # Notify student
            await create_notification(
                user_id=st["user_id"],
                title="Class Absence Notification",
                message=f"You were marked {status_val.replace('_', ' ')} for {subject_name} (Period {batch.period}) on {batch.date}.",
                notif_type="ABSENT",
                meta_data={"subject": subject_name, "period": batch.period, "date": batch.date}
            )
            # Notify Parent
            if st.get("parent_id"):
                parent = await parents_col.find_one({"_id": st["parent_id"]})
                if parent and parent.get("user_id"):
                    await create_notification(
                        user_id=parent["user_id"],
                        title="Ward Absence Alert",
                        message=f"Your ward {st.get('name')} was marked absent for {subject_name} on {batch.date} (Period {batch.period}).",
                        notif_type="ABSENT",
                        meta_data={"student_name": st.get("name"), "subject": subject_name, "date": batch.date}
                    )
                    
        # Check and trigger fine if attendance dropped
        await evaluate_and_generate_student_fine(entry.student_id)
        
    await record_audit_log(
        actor_id=current_user["_id"],
        actor_name=current_user["name"],
        actor_role=current_user["role"],
        action_type="SUBMIT_ATTENDANCE",
        entity_name="attendance",
        details=f"Marked attendance for {class_name} - {subject_name} (P{batch.period}, {batch.date}) - {len(inserted_records)} students"
    )
    return {"message": f"Successfully submitted attendance for {len(inserted_records)} students", "records_count": len(inserted_records)}

@router.get("/records")
async def get_attendance_records(
    class_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    date: Optional[str] = None,
    period: Optional[int] = None,
    student_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    att_col = get_collection("attendance")
    query = {}
    
    # Strict role data scoping
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
        if student_id:
            query["student_id"] = student_id
            
    if class_id:
        query["class_id"] = class_id
    if subject_id:
        query["subject_id"] = subject_id
    if date:
        query["date"] = date
    if period:
        query["period"] = period
        
    return await att_col.find(query, sort=[("date", -1), ("period", 1)])

@router.put("/{record_id}/override")
async def override_attendance(
    record_id: str,
    new_status: str,
    reason: str,
    current_user: dict = Depends(require_roles(["tutor", "admin"]))
):
    att_col = get_collection("attendance")
    record = await att_col.find_one({"_id": record_id})
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
        
    old_status = record.get("status")
    await att_col.update_one(
        {"_id": record_id},
        {"$set": {
            "status": new_status,
            "modified_by": current_user["name"],
            "modification_reason": reason,
            "modified_at": datetime.utcnow().isoformat()
        }}
    )
    
    await record_audit_log(
        actor_id=current_user["_id"],
        actor_name=current_user["name"],
        actor_role=current_user["role"],
        action_type="ATTENDANCE_OVERRIDE",
        entity_name="attendance",
        entity_id=record_id,
        details=f"Changed status from {old_status} to {new_status}. Reason: {reason}",
        old_value=old_status,
        new_value=new_status
    )
    
    # Re-evaluate fine status
    await evaluate_and_generate_student_fine(record.get("student_id"))
    return {"message": "Attendance record updated successfully"}
