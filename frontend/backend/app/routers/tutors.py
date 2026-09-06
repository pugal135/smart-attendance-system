from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.database import get_collection
from app.models.tutor import TutorCreate, TutorResponse
from app.services.auth_service import require_roles, get_password_hash, get_current_user
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/tutors", tags=["Tutors"])

@router.get("")
async def list_tutors(department_id: Optional[str] = None):
    tutors_col = get_collection("tutors")
    dept_col = get_collection("departments")
    
    query = {}
    if department_id:
        query["department_id"] = department_id
    tutors = await tutors_col.find(query, sort=[("name", 1)])
    
    res = []
    for t in tutors:
        d = await dept_col.find_one({"_id": t.get("department_id")})
        t_copy = dict(t)
        t_copy["department_name"] = d.get("name") if d else ""
        res.append(t_copy)
    return res

@router.post("")
async def create_tutor(data: TutorCreate, current_user: dict = Depends(require_roles(["admin"]))):
    users_col = get_collection("users")
    tutors_col = get_collection("tutors")
    
    existing_user = await users_col.find_one({"email": {"$regex": f"^{data.email}$", "$options": "i"}})
    if existing_user:
        raise HTTPException(status_code=400, detail="Tutor email already exists.")
        
    existing_emp = await tutors_col.find_one({"employee_id": {"$regex": f"^{data.employee_id}$", "$options": "i"}})
    if existing_emp:
        raise HTTPException(status_code=400, detail=f"Employee ID '{data.employee_id}' already registered.")
        
    u_doc = {
        "email": data.email,
        "name": data.name,
        "role": "tutor",
        "phone": data.phone,
        "hashed_password": get_password_hash(data.password),
        "is_active": True
    }
    u_res = await users_col.insert_one(u_doc)
    
    t_doc = {
        "user_id": u_res.inserted_id,
        "name": data.name,
        "employee_id": data.employee_id,
        "email": data.email,
        "phone": data.phone,
        "department_id": data.department_id,
        "designation": data.designation,
        "qualification": data.qualification,
        "assigned_class_ids": data.assigned_class_ids,
        "assigned_subject_ids": data.assigned_subject_ids
    }
    t_res = await tutors_col.insert_one(t_doc)
    t_doc["_id"] = t_res.inserted_id
    
    await record_audit_log(current_user["_id"], current_user["name"], current_user["role"], "CREATE_TUTOR", "tutors", t_res.inserted_id)
    return t_doc

@router.put("/{tutor_id}/assignments")
async def update_tutor_assignments(
    tutor_id: str,
    class_ids: List[str],
    subject_ids: List[str],
    current_user: dict = Depends(require_roles(["admin"]))
):
    tutors_col = get_collection("tutors")
    subjects_col = get_collection("subjects")
    
    await tutors_col.update_one(
        {"_id": tutor_id},
        {"$set": {"assigned_class_ids": class_ids, "assigned_subject_ids": subject_ids}}
    )
    # Link subjects to tutor
    await subjects_col.update_many(
        {"_id": {"$in": subject_ids}},
        {"$set": {"tutor_id": tutor_id}}
    )
    return {"message": "Tutor assignments updated successfully"}
