from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.database import get_collection
from app.models.student import StudentCreate, StudentResponse
from app.services.auth_service import require_roles, get_password_hash, get_current_user
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("")
async def list_students(
    class_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    students_col = get_collection("students")
    classes_col = get_collection("classes")
    
    query = {}
    if class_id:
        query["class_id"] = class_id
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"register_number": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
        
    students = await students_col.find(query, sort=[("register_number", 1)])
    res = []
    for s in students:
        c = await classes_col.find_one({"_id": s.get("class_id")})
        s_copy = dict(s)
        s_copy["class_name"] = c.get("name") if c else ""
        res.append(s_copy)
    return res

@router.post("")
async def create_student(data: StudentCreate, current_user: dict = Depends(require_roles(["admin"]))):
    users_col = get_collection("users")
    students_col = get_collection("students")
    parents_col = get_collection("parents")
    classes_col = get_collection("classes")
    
    # Check duplicate student email or register number
    existing_user = await users_col.find_one({"email": {"$regex": f"^{data.email}$", "$options": "i"}})
    if existing_user:
        raise HTTPException(status_code=400, detail="Student email already registered.")
        
    existing_reg = await students_col.find_one({"register_number": {"$regex": f"^{data.register_number}$", "$options": "i"}})
    if existing_reg:
        raise HTTPException(status_code=400, detail=f"Register number '{data.register_number}' already exists.")
        
    # 1. Create User account for student
    u_doc = {
        "email": data.email,
        "name": data.name,
        "role": "student",
        "phone": data.phone,
        "hashed_password": get_password_hash(data.password),
        "is_active": True
    }
    u_res = await users_col.insert_one(u_doc)
    student_user_id = u_res.inserted_id
    
    # 2. Handle Parent Linking
    parent_id = None
    if data.parent_email:
        parent_user = await users_col.find_one({"email": {"$regex": f"^{data.parent_email}$", "$options": "i"}})
        if not parent_user:
            # Auto-create parent user with default pass
            p_pass = data.parent_phone if data.parent_phone else "parent123"
            p_user_doc = {
                "email": data.parent_email,
                "name": data.parent_name or f"Parent of {data.name}",
                "role": "parent",
                "phone": data.parent_phone,
                "hashed_password": get_password_hash(p_pass),
                "is_active": True
            }
            p_u_res = await users_col.insert_one(p_user_doc)
            
            p_doc = {
                "user_id": p_u_res.inserted_id,
                "name": data.parent_name or f"Parent of {data.name}",
                "email": data.parent_email,
                "phone": data.parent_phone,
                "student_ids": [],
                "relationship": data.parent_relation or "Parent"
            }
            p_res = await parents_col.insert_one(p_doc)
            parent_id = p_res.inserted_id
        else:
            p_doc = await parents_col.find_one({"user_id": parent_user["_id"]})
            parent_id = p_doc["_id"] if p_doc else None
            
    # 3. Create Student Document
    class_doc = await classes_col.find_one({"_id": data.class_id})
    class_name = class_doc.get("name") if class_doc else ""
    
    st_doc = {
        "user_id": student_user_id,
        "name": data.name,
        "register_number": data.register_number,
        "roll_no": data.roll_no,
        "email": data.email,
        "phone": data.phone,
        "class_id": data.class_id,
        "class_name": class_name,
        "parent_id": parent_id,
        "parent_name": data.parent_name,
        "parent_email": data.parent_email,
        "parent_phone": data.parent_phone,
        "address": data.address,
        "date_of_birth": data.date_of_birth,
        "status": "ACTIVE"
    }
    st_res = await students_col.insert_one(st_doc)
    student_id = st_res.inserted_id
    st_doc["_id"] = student_id
    
    # Append student_id to parent if exists
    if parent_id:
        await parents_col.update_one({"_id": parent_id}, {"$push": {"student_ids": student_id}})
        
    await record_audit_log(current_user["_id"], current_user["name"], current_user["role"], "CREATE_STUDENT", "students", student_id)
    return st_doc

@router.get("/{student_id}")
async def get_student_details(student_id: str):
    students_col = get_collection("students")
    classes_col = get_collection("classes")
    st = await students_col.find_one({"_id": student_id})
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")
    c = await classes_col.find_one({"_id": st.get("class_id")})
    st_copy = dict(st)
    st_copy["class_name"] = c.get("name") if c else ""
    return st_copy

@router.patch("/{student_id}/status")
async def toggle_student_status(student_id: str, status: str, current_user: dict = Depends(require_roles(["admin"]))):
    students_col = get_collection("students")
    users_col = get_collection("users")
    
    st = await students_col.find_one({"_id": student_id})
    if not st:
        raise HTTPException(status_code=404, detail="Student not found")
        
    is_active = (status.upper() == "ACTIVE")
    await students_col.update_one({"_id": student_id}, {"$set": {"status": status.upper()}})
    await users_col.update_one({"_id": st["user_id"]}, {"$set": {"is_active": is_active}})
    
    await record_audit_log(current_user["_id"], current_user["name"], current_user["role"], "TOGGLE_STUDENT_STATUS", "students", student_id, f"Status set to {status}")
    return {"message": f"Student status updated to {status}"}
