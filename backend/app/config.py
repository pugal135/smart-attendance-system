import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Attendance & Student Risk Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart_attendance_super_secret_jwt_key_2026_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # MongoDB
    MONGODB_URL: str = os.getenv("MONGODB_URL") or os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME") or os.getenv("MONGO_DB_NAME", "smart_attendance")
    
    # SMTP / Email
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "alerts@college-attendance.edu")
    
    # Default Policy Rules
    DEFAULT_REQUIRED_ATTENDANCE: float = 75.0
    DEFAULT_LOW_ATTENDANCE_THRESHOLD: float = 75.0
    DEFAULT_MEDIUM_RISK_THRESHOLD: float = 65.0
    DEFAULT_HIGH_RISK_THRESHOLD: float = 65.0
    DEFAULT_FINE_AMOUNT_PER_SHORTAGE: float = 500.0
    DEFAULT_FINE_DUE_DAYS: int = 2
    CONSECUTIVE_ABSENCE_ALERT_COUNT: int = 3
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
