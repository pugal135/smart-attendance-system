from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from app.database import get_collection
from app.models.user import UserLogin, UserCreate, UserResponse
from app.services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(credentials: UserLogin):
    users_col = get_collection("users")
    students_col = get_collection("students")
    tutors_col = get_collection("tutors")
    
    # Identifier can be Email or Register Number or Employee ID
    ident = credentials.identifier.strip()
    req_role = credentials.role.lower().strip()
    
    user = None
    # Check if student register number
    if req_role == "student":
        student = await students_col.find_one({"register_number": {"$regex": f"^{ident}$", "$options": "i"}})
        if student:
            user = await users_col.find_one({"_id": student.get("user_id")})
    # Check if tutor employee id
    elif req_role == "tutor":
        tutor = await tutors_col.find_one({"employee_id": {"$regex": f"^{ident}$", "$options": "i"}})
        if tutor:
            user = await users_col.find_one({"_id": tutor.get("user_id")})
            
    if not user:
        user = await users_col.find_one({
            "email": {"$regex": f"^{ident}$", "$options": "i"}
        })
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or account does not exist."
        )
        
    if user.get("role", "").lower() != req_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account exists but role mismatch. Selected role is '{req_role}', but account is registered as '{user.get('role')}'."
        )
        
    if not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password."
        )
        
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been disabled by administrator."
        )
        
    token = create_access_token(data={"sub": str(user["_id"]), "role": user["role"], "email": user["email"]})
    
    # Retrieve linked profile entity ID
    linked_id = None
    if user["role"] == "student":
        st = await students_col.find_one({"user_id": user["_id"]})
        if st:
            linked_id = str(st["_id"])
    elif user["role"] == "tutor":
        tu = await tutors_col.find_one({"user_id": user["_id"]})
        if tu:
            linked_id = str(tu["_id"])
    elif user["role"] == "parent":
        pa = await get_collection("parents").find_one({"user_id": user["_id"]})
        if pa:
            linked_id = str(pa["_id"])
            
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "phone": user.get("phone"),
            "linked_entity_id": linked_id
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    students_col = get_collection("students")
    tutors_col = get_collection("tutors")
    parents_col = get_collection("parents")
    
    profile_data = {}
    if current_user["role"] == "student":
        profile_data = await students_col.find_one({"user_id": current_user["_id"]}) or {}
    elif current_user["role"] == "tutor":
        profile_data = await tutors_col.find_one({"user_id": current_user["_id"]}) or {}
    elif current_user["role"] == "parent":
        profile_data = await parents_col.find_one({"user_id": current_user["_id"]}) or {}
        
    return {
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "phone": current_user.get("phone"),
        "profile": profile_data
    }
