from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class TutorCreate(BaseModel):
    name: str
    employee_id: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    department_id: str
    designation: Optional[str] = "Assistant Professor"
    qualification: Optional[str] = "M.Tech / Ph.D"
    assigned_class_ids: List[str] = []
    assigned_subject_ids: List[str] = []

class TutorResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    name: str
    employee_id: str
    email: str
    phone: Optional[str] = None
    department_id: str
    department_name: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    assigned_class_ids: List[str] = []
    assigned_subject_ids: List[str] = []
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True
