from pydantic import BaseModel, Field
from typing import Optional

class AcademicRecordCreate(BaseModel):
    student_id: str
    subject_id: str
    semester: int
    internal_1_marks: float # out of 50
    internal_2_marks: float # out of 50
    assignment_marks: float # out of 20
    unit_test_marks: float # out of 30

class AcademicRecordResponse(AcademicRecordCreate):
    id: str = Field(alias="_id")
    student_name: Optional[str] = None
    subject_name: Optional[str] = None
    predicted_final_range: Optional[str] = None
    predicted_grade: Optional[str] = None
    prediction_confidence: Optional[float] = None
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True
