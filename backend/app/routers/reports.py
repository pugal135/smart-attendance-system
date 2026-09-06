from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse, Response
from typing import Optional
import io
from app.database import get_collection
from app.services.auth_service import require_roles, get_current_user
from app.services.report_generator import generate_attendance_csv, generate_attendance_excel, generate_attendance_pdf

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/export/csv")
async def export_attendance_csv(
    class_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(require_roles(["admin", "tutor"]))
):
    att_col = get_collection("attendance")
    query = {}
    if class_id:
        query["class_id"] = class_id
    if subject_id:
        query["subject_id"] = subject_id
    if date:
        query["date"] = date
        
    records = await att_col.find(query, sort=[("date", -1), ("period", 1)])
    csv_stream = generate_attendance_csv(records)
    
    return Response(
        content=csv_stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_report_{date or 'all'}.csv"}
    )

@router.get("/export/excel")
async def export_attendance_excel(
    class_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(require_roles(["admin", "tutor"]))
):
    att_col = get_collection("attendance")
    query = {}
    if class_id:
        query["class_id"] = class_id
    if subject_id:
        query["subject_id"] = subject_id
    if date:
        query["date"] = date
        
    records = await att_col.find(query, sort=[("date", -1), ("period", 1)])
    excel_stream = generate_attendance_excel(records)
    
    return StreamingResponse(
        io.BytesIO(excel_stream.getvalue()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=attendance_report_{date or 'all'}.xlsx"}
    )

@router.get("/export/pdf")
async def export_attendance_pdf(
    class_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(require_roles(["admin", "tutor"]))
):
    att_col = get_collection("attendance")
    query = {}
    if class_id:
        query["class_id"] = class_id
    if subject_id:
        query["subject_id"] = subject_id
    if date:
        query["date"] = date
        
    records = await att_col.find(query, sort=[("date", -1), ("period", 1)])
    pdf_stream = generate_attendance_pdf("Smart Attendance & Academic Log", records)
    
    return StreamingResponse(
        io.BytesIO(pdf_stream.getvalue()),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=attendance_report_{date or 'all'}.pdf"}
    )
