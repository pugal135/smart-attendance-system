from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime

Role = Literal["student", "parent", "tutor", "admin"]
AttendanceStatus = Literal["present", "absent", "late"]
LeaveStatus = Literal["pending", "approved", "rejected"]
PaymentStatus = Literal["pending", "payment_confirmed", "paid", "overdue"]
ClearanceStatus = Literal["not_required", "clearance_required", "clearance_completed"]


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    user_id: str
    name: str


# ---------- Users / Admin management ----------
class DepartmentCreate(BaseModel):
    name: str
    code: str


class ClassCreate(BaseModel):
    name: str  # e.g. "II B.Sc AI & ML"
    department_id: str
    year: int
    section: Optional[str] = None
    tutor_id: Optional[str] = None


class SubjectCreate(BaseModel):
    name: str
    code: str
    class_id: str
    tutor_id: Optional[str] = None


class StudentCreate(BaseModel):
    name: str
    email: str
    password: str
    roll_number: str
    class_id: str
    parent_email: Optional[str] = None


class ParentCreate(BaseModel):
    name: str
    email: str
    password: str
    linked_student_roll_number: str


class TutorCreate(BaseModel):
    name: str
    email: str
    password: str
    department_id: Optional[str] = None
    assigned_class_ids: list[str] = []
    assigned_subject_ids: list[str] = []


class RiskConfigUpdate(BaseModel):
    safe_threshold: float = Field(ge=0, le=100)
    medium_threshold: float = Field(ge=0, le=100)
    required_attendance: float = Field(ge=0, le=100)


class FineRuleUpdate(BaseModel):
    trigger_threshold_percent: float = Field(ge=0, le=100)
    fine_amount: float = Field(ge=0)
    payment_window_days: int = Field(ge=1)


# ---------- Attendance ----------
class AttendanceEntry(BaseModel):
    student_id: str
    status: AttendanceStatus


class MarkAttendanceRequest(BaseModel):
    class_id: str
    subject_id: str
    date: date
    entries: list[AttendanceEntry]


class AttendanceEditRequest(BaseModel):
    status: AttendanceStatus
    reason: str


# ---------- Leave ----------
class LeaveRequestCreate(BaseModel):
    date: date
    reason: str
    supporting_info: Optional[str] = None


class LeaveDecision(BaseModel):
    decision: LeaveStatus
    remarks: Optional[str] = None


class ExplanationRequest(BaseModel):
    message: str


# ---------- Recovery calculator ----------
class RecoveryCalcRequest(BaseModel):
    additional_classes_attending: int = Field(ge=0)


# ---------- Academic records ----------
class AcademicRecordCreate(BaseModel):
    student_id: str
    subject_id: str
    internal_marks: Optional[float] = None
    assignment_marks: Optional[float] = None
    unit_test_marks: Optional[float] = None
    previous_exam_marks: Optional[float] = None


# ---------- Notifications ----------
class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    read: bool
    created_at: datetime
