from pydantic import BaseModel, Field
from typing import Optional

class LeaveApply(BaseModel):
    from_date: str # YYYY-MM-DD
    to_date: str # YYYY-MM-DD
    reason: str
    attachment_url: Optional[str] = None

class LeaveReview(BaseModel):
    status: str # "APPROVED", "REJECTED"
    remarks: Optional[str] = None

class LeaveResponse(BaseModel):
    id: str = Field(alias="_id")
    student_id: str
    student_name: Optional[str] = None
    register_number: Optional[str] = None
    class_id: str
    class_name: Optional[str] = None
    from_date: str
    to_date: str
    reason: str
    attachment_url: Optional[str] = None
    status: str = "PENDING"
    reviewed_by: Optional[str] = None
    reviewer_name: Optional[str] = None
    reviewed_at: Optional[str] = None
    review_remarks: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True

class AbsenceExplanationRequest(BaseModel):
    attendance_id: str
    student_id: str
    remarks: Optional[str] = None

class AbsenceExplanationSubmit(BaseModel):
    explanation_text: str

class AbsenceExplanationReview(BaseModel):
    status: str # "ACCEPTED", "REJECTED"
    tutor_remarks: Optional[str] = None
