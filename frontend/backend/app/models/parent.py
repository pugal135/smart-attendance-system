from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class ParentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    student_ids: List[str] = []
    relationship: Optional[str] = "Parent"
    occupation: Optional[str] = None
    address: Optional[str] = None

class ParentResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    student_ids: List[str] = []
    relationship: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True
