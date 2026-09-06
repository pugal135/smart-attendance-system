import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import db_manager, get_collection
from app.services.auth_service import get_password_hash
from app.models.setting import SystemSettingsModel

from app.routers import (
    auth,
    academics,
    students,
    tutors,
    parents,
    attendance,
    qr,
    leaves,
    fines,
    payments,
    clearance,
    analytics,
    notifications,
    settings as settings_router,
    audit,
    reports,
    admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB and initialize default Administrator & system configuration
    await db_manager.connect()
    users_col = get_collection("users")
    settings_col = get_collection("settings")
    
    # Initialize default admin if none exists
    admin_user = await users_col.find_one({"role": "admin"})
    if not admin_user:
        default_admin = {
            "email": "admin@college.edu",
            "name": "System Administrator",
            "role": "admin",
            "phone": "+91 98765 43210",
            "hashed_password": get_password_hash("admin123"),
            "is_active": True
        }
        await users_col.insert_one(default_admin)
        print("[INIT] Default Administrator created: admin@college.edu / admin123")
        
    # Initialize settings if empty
    sys_set = await settings_col.find_one({})
    if not sys_set:
        await settings_col.insert_one(SystemSettingsModel().dict())
        print("[INIT] Default Academic & Fine policy settings initialized.")
        
    yield
    print("[SHUTDOWN] Application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade real-time Smart Attendance & Student Risk Management API",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(academics.router, prefix=settings.API_V1_STR)
app.include_router(students.router, prefix=settings.API_V1_STR)
app.include_router(tutors.router, prefix=settings.API_V1_STR)
app.include_router(parents.router, prefix=settings.API_V1_STR)
app.include_router(attendance.router, prefix=settings.API_V1_STR)
app.include_router(qr.router, prefix=settings.API_V1_STR)
app.include_router(leaves.router, prefix=settings.API_V1_STR)
app.include_router(fines.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(clearance.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "tagline": "Track Attendance. Predict Risk. Stay Connected.",
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health():
    return {"status": "HEALTHY", "db_mode": "MOTOR_LIVE_MONGO" if db_manager.is_motor else "PERSISTENT_ASYNC_DOCUMENT_STORE"}
