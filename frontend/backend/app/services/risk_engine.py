from datetime import datetime
from typing import Dict, List, Any, Optional
from app.database import get_collection

async def calculate_student_attendance_stats(student_id: str) -> Dict[str, Any]:
    att_col = get_collection("attendance")
    settings_col = get_collection("settings")
    subjects_col = get_collection("subjects")
    
    sys_settings = await settings_col.find_one({}) or {}
    req_pct = float(sys_settings.get("required_attendance_percentage", 75.0))
    high_pct = float(sys_settings.get("high_risk_threshold", 65.0))
    
    records = await att_col.find({"student_id": student_id}, sort=[("date", 1), ("period", 1)])
    
    if not records:
        return {
            "has_data": False,
            "total_classes": 0,
            "present_count": 0,
            "absent_count": 0,
            "late_count": 0,
            "leave_count": 0,
            "overall_percentage": 0.0,
            "risk_level": "NO_DATA",
            "risk_message": "No attendance records available yet.",
            "is_dropping": False,
            "drop_warning": None,
            "consecutive_absences": 0,
            "consecutive_absence_alert": False,
            "subject_breakdown": [],
            "weekly_trend": [],
            "forecast_message": "Insufficient real data for prediction."
        }
        
    total_classes = len(records)
    present_count = sum(1 for r in records if r.get("status") in ["PRESENT", "LATE"])
    absent_count = sum(1 for r in records if r.get("status") in ["ABSENT", "UNINFORMED_ABSENCE"])
    late_count = sum(1 for r in records if r.get("status") == "LATE")
    leave_count = sum(1 for r in records if r.get("status") == "APPROVED_LEAVE")
    
    overall_percentage = round((present_count / total_classes * 100), 2) if total_classes > 0 else 0.0
    
    # Risk Level categorization
    if overall_percentage >= req_pct:
        risk_level = "LOW"
        risk_message = "Good standing. Attendance satisfies university requirements."
    elif overall_percentage >= high_pct:
        risk_level = "MEDIUM"
        risk_message = "Warning: Attendance is approaching low threshold."
    else:
        risk_level = "HIGH"
        risk_message = "Critical: Attendance is below required threshold."
        
    # Consecutive Absences check
    consecutive_absences = 0
    for r in reversed(records):
        if r.get("status") in ["ABSENT", "UNINFORMED_ABSENCE"]:
            consecutive_absences += 1
        else:
            break
            
    consec_alert_threshold = int(sys_settings.get("consecutive_absence_alert_count", 3))
    consecutive_absence_alert = (consecutive_absences >= consec_alert_threshold)
    
    # Subject breakdown
    subject_map = {}
    for r in records:
        sub_id = r.get("subject_id")
        if sub_id not in subject_map:
            subject_map[sub_id] = {"total": 0, "present": 0, "absent": 0, "late": 0, "name": r.get("subject_name", "Subject")}
        subject_map[sub_id]["total"] += 1
        if r.get("status") in ["PRESENT", "LATE"]:
            subject_map[sub_id]["present"] += 1
        elif r.get("status") in ["ABSENT", "UNINFORMED_ABSENCE"]:
            subject_map[sub_id]["absent"] += 1
        if r.get("status") == "LATE":
            subject_map[sub_id]["late"] += 1
            
    subject_breakdown = []
    for sub_id, data in subject_map.items():
        sub_doc = await subjects_col.find_one({"_id": sub_id})
        name = sub_doc.get("name") if sub_doc else data["name"]
        code = sub_doc.get("code") if sub_doc else ""
        pct = round((data["present"] / data["total"] * 100), 2) if data["total"] > 0 else 0.0
        
        sub_risk = "LOW"
        if pct < high_pct:
            sub_risk = "HIGH"
        elif pct < req_pct:
            sub_risk = "MEDIUM"
            
        subject_breakdown.append({
            "subject_id": sub_id,
            "subject_name": name,
            "subject_code": code,
            "total_classes": data["total"],
            "present_classes": data["present"],
            "percentage": pct,
            "risk_level": sub_risk
        })
        
    # Attendance Trend & Drop Detection (sliding window)
    window_size = 4
    weekly_trend = []
    for i in range(0, total_classes, window_size):
        chunk = records[i:i+window_size]
        c_pres = sum(1 for r in chunk if r.get("status") in ["PRESENT", "LATE"])
        c_pct = round((c_pres / len(chunk) * 100), 1)
        label = f"Session {i+1}-{i+len(chunk)}"
        weekly_trend.append({"period": label, "percentage": c_pct, "date": chunk[-1].get("date", "")})
        
    is_dropping = False
    drop_warning = None
    if len(weekly_trend) >= 3:
        percentages = [w["percentage"] for w in weekly_trend[-3:]]
        if percentages[0] > percentages[1] > percentages[2] and (percentages[0] - percentages[2] >= 5.0):
            is_dropping = True
            drop_warning = f"Attendance drop detected: decreased from {percentages[0]}% to {percentages[2]}% over recent sessions."
            
    # Forecast Engine
    if total_classes < 5:
        forecast_message = "Insufficient real data for reliable attendance forecast."
        forecast_status = "NEEDS_MORE_DATA"
    else:
        recent_chunk = records[-10:] if len(records) >= 10 else records
        recent_rate = sum(1 for r in recent_chunk if r.get("status") in ["PRESENT", "LATE"]) / len(recent_chunk)
        projected_10_more_pct = round(((present_count + (recent_rate * 10)) / (total_classes + 10)) * 100, 1)
        if projected_10_more_pct >= req_pct:
            forecast_message = f"If current pattern continues (~{round(recent_rate*100)}%), projected attendance over the next 10 sessions is ~{projected_10_more_pct}% (Low Risk)."
            forecast_status = "POSITIVE"
        else:
            forecast_message = f"Warning: If current pattern continues (~{round(recent_rate*100)}%), projected attendance will be ~{projected_10_more_pct}%, which remains below {req_pct}%."
            forecast_status = "WARNING"
            
    return {
        "has_data": True,
        "total_classes": total_classes,
        "present_count": present_count,
        "absent_count": absent_count,
        "late_count": late_count,
        "leave_count": leave_count,
        "overall_percentage": overall_percentage,
        "risk_level": risk_level,
        "risk_message": risk_message,
        "is_dropping": is_dropping,
        "drop_warning": drop_warning,
        "consecutive_absences": consecutive_absences,
        "consecutive_absence_alert": consecutive_absence_alert,
        "subject_breakdown": subject_breakdown,
        "weekly_trend": weekly_trend,
        "forecast_message": forecast_message,
        "forecast_status": forecast_status
    }
