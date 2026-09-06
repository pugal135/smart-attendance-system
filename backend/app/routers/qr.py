import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_collection
from app.models.attendance import QRSessionCreate, QRScanSubmit
from app.services.auth_service import require_roles, get_current_user
from app.services.audit_service import record_audit_log
from app.services.fine_engine import evaluate_and_generate_student_fine

router = APIRouter(prefix="/qr", tags=["QR Attendance"])

@router.post("/create-session")
async def create_qr_session(
    data: QRSessionCreate,
    current_user: dict = Depends(require_roles(["tutor", "admin"]))
):
    sessions_col = get_collection("qr_sessions")
    classes_col = get_collection("classes")
    subjects_col = get_collection("subjects")
    
    c = await classes_col.find_one({"_id": data.class_id})
    s = await subjects_col.find_one({"_id": data.subject_id})
    
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    session_token = f"QR_{uuid.uuid4().hex[:12].upper()}"
    expires_at = datetime.utcnow() + timedelta(seconds=data.duration_seconds)
    
    doc = {
        "session_token": session_token,
        "class_id": data.class_id,
        "class_name": c.get("name") if c else "",
        "subject_id": data.subject_id,
        "subject_name": s.get("name") if s else "",
        "tutor_id": current_user["_id"],
        "tutor_name": current_user["name"],
        "date": today_str,
        "period": data.period,
        "expires_at": expires_at.isoformat(),
        "is_active": True,
        "scanned_students": [],
        "created_at": datetime.utcnow().isoformat()
    }
    res = await sessions_col.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    return {
        "session_id": doc["_id"],
        "session_token": session_token,
        "class_name": doc["class_name"],
        "subject_name": doc["subject_name"],
        "expires_at": doc["expires_at"],
        "period": data.period,
        "date": today_str
    }

@router.post("/scan")
async def scan_qr_attendance(
    data: QRScanSubmit,
    current_user: dict = Depends(require_roles(["student"]))
):
    sessions_col = get_collection("qr_sessions")
    att_col = get_collection("attendance")
    students_col = get_collection("students")
    
    student = await students_col.find_one({"user_id": current_user["_id"]})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    session = await sessions_col.find_one({"session_token": data.session_token, "is_active": True})
    if not session:
        raise HTTPException(status_code=400, detail="Invalid or expired QR code session.")
        
    # Check expiration time
    exp = datetime.fromisoformat(session["expires_at"])
    if datetime.utcnow() > exp:
        await sessions_col.update_one({"_id": session["_id"]}, {"$set": {"is_active": False}})
        raise HTTPException(status_code=400, detail="QR Code session has expired.")
        
    # Verify student is in this class
    if student.get("class_id") != session.get("class_id"):
        raise HTTPException(status_code=403, detail="You do not belong to this class section.")
        
    # Check if student already checked in
    scanned_list = session.get("scanned_students", [])
    if any(s.get("student_id") == student["_id"] for s in scanned_list):
        raise HTTPException(status_code=400, detail="You have already marked attendance for this QR session.")
        
    # Check duplicate in attendance collection
    existing_att = await att_col.find_one({
        "student_id": student["_id"],
        "subject_id": session["subject_id"],
        "date": session["date"],
        "period": session["period"]
    })
    if existing_att:
        raise HTTPException(status_code=400, detail="Attendance already recorded for this period.")
        
    now_str = datetime.utcnow().isoformat()
    # Insert attendance record
    att_doc = {
        "student_id": student["_id"],
        "student_name": student.get("name"),
        "register_number": student.get("register_number"),
        "class_id": session["class_id"],
        "class_name": session["class_name"],
        "subject_id": session["subject_id"],
        "subject_name": session["subject_name"],
        "tutor_id": session["tutor_id"],
        "tutor_name": session["tutor_name"],
        "date": session["date"],
        "period": session["period"],
        "status": "PRESENT",
        "entry_mode": "QR_SCAN",
        "marked_at": now_str,
        "created_at": now_str
    }
    await att_col.insert_one(att_doc)
    
    # Add to scanned list
    scanned_entry = {
        "student_id": student["_id"],
        "student_name": student.get("name"),
        "register_number": student.get("register_number"),
        "scanned_at": now_str
    }
    await sessions_col.update_one({"_id": session["_id"]}, {"$push": {"scanned_students": scanned_entry}})
    
    return {
        "success": True,
        "message": f"Verified! Attendance marked PRESENT for {session['subject_name']} (Period {session['period']}).",
        "student_name": student.get("name"),
        "subject_name": session["subject_name"]
    }

@router.get("/{session_id}/live-feed")
async def get_qr_live_feed(
    session_id: str,
    current_user: dict = Depends(require_roles(["tutor", "admin"]))
):
    sessions_col = get_collection("qr_sessions")
    session = await sessions_col.find_one({"_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    exp = datetime.fromisoformat(session["expires_at"])
    time_left_sec = max(0, int((exp - datetime.utcnow()).total_seconds()))
    
    return {
        "session_id": session["_id"],
        "session_token": session["session_token"],
        "is_active": session.get("is_active", True) and time_left_sec > 0,
        "time_left_seconds": time_left_sec,
        "scanned_count": len(session.get("scanned_students", [])),
        "scanned_students": session.get("scanned_students", [])
    }
