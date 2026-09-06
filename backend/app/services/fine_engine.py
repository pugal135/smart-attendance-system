from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.database import get_collection
from app.services.risk_engine import calculate_student_attendance_stats
from app.services.notification_service import create_notification

async def evaluate_and_generate_student_fine(student_id: str) -> Optional[Dict[str, Any]]:
    students_col = get_collection("students")
    fines_col = get_collection("fines")
    settings_col = get_collection("settings")
    classes_col = get_collection("classes")
    clearance_col = get_collection("clearances")
    
    student = await students_col.find_one({"_id": student_id})
    if not student:
        return None
        
    sys_settings = await settings_col.find_one({}) or {}
    high_risk_threshold = float(sys_settings.get("high_risk_threshold", 65.0))
    fine_amount = float(sys_settings.get("fine_amount_per_shortage", 500.0))
    due_days = int(sys_settings.get("fine_due_days", 2))
    
    stats = await calculate_student_attendance_stats(student_id)
    if not stats.get("has_data") or stats.get("total_classes", 0) < 5:
        return None
        
    current_pct = stats.get("overall_percentage", 100.0)
    
    if current_pct < high_risk_threshold:
        existing_fine = await fines_col.find_one({
            "student_id": student_id,
            "status": {"$in": ["PENDING", "PAYMENT_PROCESSING", "OVERDUE"]}
        })
        if existing_fine:
            return existing_fine
            
        now = datetime.utcnow()
        due_date = now + timedelta(days=due_days)
        
        class_doc = await classes_col.find_one({"_id": student.get("class_id")})
        class_name = class_doc.get("name") if class_doc else ""
        
        fine_doc = {
            "student_id": student_id,
            "student_name": student.get("name"),
            "register_number": student.get("register_number"),
            "class_name": class_name,
            "attendance_percentage_snapshot": current_pct,
            "fine_amount": fine_amount,
            "reason": f"Attendance fell to {current_pct}% (below required {high_risk_threshold}% threshold)",
            "generated_date": now.strftime("%Y-%m-%d %H:%M:%S"),
            "due_date": due_date.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "PENDING",
            "created_at": now.isoformat()
        }
        res = await fines_col.insert_one(fine_doc)
        fine_id = res.inserted_id
        
        await clearance_col.update_one(
            {"student_id": student_id},
            {"$set": {
                "student_id": student_id,
                "student_name": student.get("name"),
                "register_number": student.get("register_number"),
                "class_name": class_name,
                "fine_id": fine_id,
                "fine_amount": fine_amount,
                "status": "CLEARANCE_REQUIRED",
                "verified_by": None,
                "verified_at": None,
                "remarks": "Pending penalty settlement"
            }},
            upsert=True
        )
        
        upi_intent = f"upi://pay?pa=7708881295@ptyes&pn=Smart_College_Academic_Portal&am={fine_amount:.2f}&cu=INR&tn=Attendance_Fine_{student.get('register_number')}"
        qr_image = "/assets/penalty_qr.png"
        
        await create_notification(
            user_id=student.get("user_id"),
            title="Attendance Penalty Issued - Action Required",
            message=f"Attendance fell to {current_pct}% (below 65% threshold). Penalty fine of ₹{fine_amount} generated. Please complete payment via GPay / Paytm / PhonePe UPI Scanner (UPI ID: 7708881295@ptyes) within 2 days (Due: {due_date.strftime('%Y-%m-%d %H:%M')}).",
            notif_type="FINE_GENERATED",
            meta_data={"fine_id": fine_id, "amount": fine_amount, "due_date": fine_doc["due_date"], "upi_intent": upi_intent, "upi_id": "7708881295@ptyes", "qr_image": qr_image}
        )
        
        if student.get("parent_id"):
            parents_col = get_collection("parents")
            parent = await parents_col.find_one({"_id": student.get("parent_id")})
            if parent and parent.get("user_id"):
                await create_notification(
                    user_id=parent.get("user_id"),
                    title="Ward Attendance Shortage Alert & Fine Notice",
                    message=f"Attendance shortage penalty of ₹{fine_amount} issued for your ward {student.get('name')} ({student.get('register_number')}) - Current Attendance: {current_pct}%. Settle via GPay / Paytm / PhonePe UPI Scanner (UPI ID: 7708881295@ptyes) within 2-day deadline (Due: {due_date.strftime('%Y-%m-%d %H:%M')}).",
                    notif_type="FINE_GENERATED",
                    meta_data={"fine_id": fine_id, "student_id": student_id, "amount": fine_amount, "due_date": fine_doc["due_date"], "upi_intent": upi_intent, "upi_id": "7708881295@ptyes", "qr_image": qr_image}
                )
                
        return fine_doc
    return None
