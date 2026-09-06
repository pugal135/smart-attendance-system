from pydantic import BaseModel, Field
from typing import Optional, Any

class AuditLogResponse(BaseModel):
    id: str = Field(alias="_id")
    actor_id: str
    actor_name: str
    actor_role: str
    action_type: str # "ATTENDANCE_OVERRIDE", "LEAVE_APPROVAL", "FINE_GENERATE", "PAYMENT_CONFIRMED", "CLEARANCE_VERIFIED", "RULE_UPDATE"
    entity_name: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None
    timestamp: Optional[str] = None

    class Config:
        populate_by_name = True
