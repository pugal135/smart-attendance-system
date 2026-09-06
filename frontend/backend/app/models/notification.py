from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class NotificationResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    message: str
    type: str
    read: bool = False
    meta_data: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True
