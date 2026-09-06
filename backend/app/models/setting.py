from pydantic import BaseModel, Field
from typing import Optional

class SystemSettingsModel(BaseModel):
    required_attendance_percentage: float = 75.0
    low_attendance_threshold: float = 75.0
    medium_risk_threshold: float = 65.0
    high_risk_threshold: float = 65.0
    fine_amount_per_shortage: float = 500.0
    fine_due_days: int = 2
    consecutive_absence_alert_count: int = 3
    email_alerts_enabled: bool = True
    smtp_host: Optional[str] = ""
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = ""
    smtp_password: Optional[str] = ""
