from pydantic import BaseModel, Field
from typing import Optional, List

class AttendanceEntryItem(BaseModel):
    student_id: str
    status: str # "PRESENT", "ABSENT", "LATE", "APPROVED_LEAVE", "UNINFORMED_ABSENCE"

class AttendanceBatchSubmit(BaseModel):
    class_id: str
    subject_id: str
    date: str # "YYYY-MM-DD"
    period: int # 1 to 8
    entries: List[AttendanceEntryItem]

class AttendanceRecordResponse(BaseModel):
    id: str = Field(alias="_id")
    student_id: str
    student_name: Optional[str] = None
    register_number: Optional[str] = None
    class_id: str
    class_name: Optional[str] = None
    subject_id: str
    subject_name: Optional[str] = None
    tutor_id: str
    tutor_name: Optional[str] = None
    date: str
    period: int
    status: str
    entry_mode: str = "MANUAL" # "MANUAL", "QR_SCAN"
    marked_at: Optional[str] = None
    modified_by: Optional[str] = None
    modification_reason: Optional[str] = None

    class Config:
        populate_by_name = True

class QRSessionCreate(BaseModel):
    class_id: str
    subject_id: str
    period: int
    duration_seconds: int = 180 # 3 minutes

class QRScanSubmit(BaseModel):
    session_token: str
    student_id: Optional[str] = None
