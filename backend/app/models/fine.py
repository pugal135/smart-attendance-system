from pydantic import BaseModel, Field
from typing import Optional

class FineResponse(BaseModel):
    id: str = Field(alias="_id")
    student_id: str
    student_name: Optional[str] = None
    register_number: Optional[str] = None
    class_name: Optional[str] = None
    attendance_percentage_snapshot: float
    fine_amount: float
    reason: str
    generated_date: str
    due_date: str
    status: str # "PENDING", "PAYMENT_PROCESSING", "PAID", "OVERDUE", "WAIVED"
    paid_at: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True

class PaymentCreateOrder(BaseModel):
    fine_id: str
    payment_method: str = "UPI_QR" # "UPI_QR", "CARD", "NETBANKING"

class PaymentVerify(BaseModel):
    fine_id: str
    order_id: str
    transaction_ref: str
    payment_method: str

class ClearanceVerify(BaseModel):
    status: str # "CLEARANCE_COMPLETED", "REJECTED"
    remarks: Optional[str] = None

class ClearanceResponse(BaseModel):
    id: str = Field(alias="_id")
    student_id: str
    student_name: Optional[str] = None
    register_number: Optional[str] = None
    class_name: Optional[str] = None
    fine_id: Optional[str] = None
    fine_amount: Optional[float] = None
    status: str # "CLEARANCE_REQUIRED", "PENDING_VERIFICATION", "CLEARANCE_COMPLETED"
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None
    remarks: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True
