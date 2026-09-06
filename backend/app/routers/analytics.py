from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional, Dict, Any
from app.database import get_collection
from app.services.auth_service import get_current_user, require_roles
from app.services.risk_engine import calculate_student_attendance_stats
from app.services.recovery_calculator import calculate_recovery_plan
from app.services.ml_predictor import predict_student_academic_range

router = APIRouter(prefix="/analytics", tags=["Analytics & Risk Intelligence"])

@router.get("/admin-summary")
async def get_admin_summary(current_user: dict = Depends(require_roles(["admin"]))):
    students_col = get_collection("students")
    tutors_col = get_collection("tutors")
    parents_col = get_collection("parents")
    classes_col = get_collection("classes")
    att_col = get_collection("attendance")
    fines_col = get_collection("fines")
    leaves_col = get_collection("leave_requests")
    settings_col = get_collection("settings")
    
    sys_settings = await settings_col.find_one({}) or {}
    req_pct = float(sys_settings.get("required_attendance_percentage", 75.0))
    high_pct = float(sys_settings.get("high_risk_threshold", 65.0))
    
    total_students = await students_col.count_documents({"status": "ACTIVE"})
    total_tutors = await tutors_col.count_documents({})
    total_parents = await parents_col.count_documents({})
    total_classes = await classes_col.count_documents({})
    
    # Calculate real-time risk distribution across all active students
    all_students = await students_col.find({"status": "ACTIVE"})
    low_risk_count = 0
    med_risk_count = 0
    high_risk_count = 0
    low_attendance_students = []
    
    for s in all_students:
        stats = await calculate_student_attendance_stats(s["_id"])
        if stats.get("has_data"):
            pct = stats["overall_percentage"]
            if pct >= req_pct:
                low_risk_count += 1
            elif pct >= high_pct:
                med_risk_count += 1
                low_attendance_students.append({
                    "id": s["_id"],
                    "name": s["name"],
                    "register_number": s["register_number"],
                    "class_name": s.get("class_name", ""),
                    "percentage": pct,
                    "risk_level": "MEDIUM"
                })
            else:
                high_risk_count += 1
                low_attendance_students.append({
                    "id": s["_id"],
                    "name": s["name"],
                    "register_number": s["register_number"],
                    "class_name": s.get("class_name", ""),
                    "percentage": pct,
                    "risk_level": "HIGH"
                })
                
    # Fines stats
    pending_fines = await fines_col.count_documents({"status": {"$in": ["PENDING", "PAYMENT_PROCESSING", "OVERDUE"]}})
    total_fines_amount = sum(float(f.get("fine_amount", 0)) for f in await fines_col.find({}))
    
    # Leaves stats
    pending_leaves = await leaves_col.count_documents({"status": "PENDING"})
    
    # Today attendance stats
    today_records = await att_col.find({})
    present_today = sum(1 for r in today_records if r.get("status") in ["PRESENT", "LATE"])
    absent_today = sum(1 for r in today_records if r.get("status") in ["ABSENT", "UNINFORMED_ABSENCE"])
    
    # Risk Distribution Chart data
    risk_distribution = [
        {"name": "Low Risk (>=75%)", "value": low_risk_count, "color": "#10B981"},
        {"name": "Medium Risk (65-74%)", "value": med_risk_count, "color": "#F59E0B"},
        {"name": "High Risk (<65%)", "value": high_risk_count, "color": "#EF4444"}
    ]
    
    return {
        "has_real_data": total_students > 0 or len(today_records) > 0,
        "total_students": total_students,
        "total_tutors": total_tutors,
        "total_parents": total_parents,
        "total_classes": total_classes,
        "present_today": present_today,
        "absent_today": absent_today,
        "low_risk_count": low_risk_count,
        "medium_risk_count": med_risk_count,
        "high_risk_count": high_risk_count,
        "pending_fines_count": pending_fines,
        "total_fines_amount": total_fines_amount,
        "pending_leaves_count": pending_leaves,
        "risk_distribution": risk_distribution,
        "low_attendance_students": low_attendance_students[:15]
    }

@router.get("/student/{student_id}")
async def get_student_analytics(student_id: str, current_user: dict = Depends(get_current_user)):
    return await calculate_student_attendance_stats(student_id)

@router.get("/academic-prediction/{student_id}")
async def get_student_academic_prediction(student_id: str, current_user: dict = Depends(get_current_user)):
    return await predict_student_academic_range(student_id)

@router.post("/recovery-calculator")
async def calculate_recovery(
    student_id: str,
    target_percentage: float = 75.0,
    classes_to_attend: int = 5,
    current_user: dict = Depends(get_current_user)
):
    stats = await calculate_student_attendance_stats(student_id)
    return calculate_recovery_plan(
        current_present=stats.get("present_count", 0),
        current_total=stats.get("total_classes", 0),
        target_percentage=target_percentage,
        classes_to_attend=classes_to_attend
    )
