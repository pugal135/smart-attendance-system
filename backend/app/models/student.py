from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class StudentCreate(BaseModel):
    name: str
    register_number: str # e.g. "26AIML001"
    roll_no: Optional[str] = None
    email: EmailStr
    password: str
    phone: Optional[str] = None
    class_id: str
    parent_name: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    parent_phone: Optional[str] = None
    parent_relation: Optional[str] = "Parent"
    address: Optional[str] = None
    date_of_birth: Optional[str] = None

class StudentResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    name: str
    register_number: str
    roll_no: Optional[str] = None
    email: str
    phone: Optional[str] = None
    class_id: str
    class_name: Optional[str] = None
    parent_id: Optional[str] = None
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    status: str = "ACTIVE"
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True
