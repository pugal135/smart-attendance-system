from pydantic import BaseModel, Field
from typing import Optional, List

class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class DepartmentResponse(DepartmentCreate):
    id: str = Field(alias="_id")
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True

class ClassCreate(BaseModel):
    department_id: str
    name: str # e.g. "II B.Sc AI & ML"
    year: int # 1, 2, 3, 4
    section: str # "A", "B"
    academic_year: str # "2026-2027"
    tutor_in_charge_id: Optional[str] = None

class ClassResponse(ClassCreate):
    id: str = Field(alias="_id")
    department_name: Optional[str] = None
    tutor_name: Optional[str] = None
    total_students: Optional[int] = 0
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True

class SubjectCreate(BaseModel):
    class_id: str
    name: str # e.g. "Python Programming"
    code: str # e.g. "CS201"
    tutor_id: Optional[str] = None
    credits: int = 3
    total_planned_hours: int = 45

class SubjectResponse(SubjectCreate):
    id: str = Field(alias="_id")
    class_name: Optional[str] = None
    tutor_name: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True
