from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.database import get_collection
from app.models.academic import DepartmentCreate, DepartmentResponse, ClassCreate, ClassResponse, SubjectCreate, SubjectResponse
from app.services.auth_service import require_roles, get_current_user
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/academics", tags=["Academics"])

@router.get("/departments")
async def list_departments():
    col = get_collection("departments")
    return await col.find({}, sort=[("name", 1)])

@router.post("/departments")
async def create_department(dept: DepartmentCreate, current_user: dict = Depends(require_roles(["admin"]))):
    col = get_collection("departments")
    existing = await col.find_one({"code": {"$regex": f"^{dept.code}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail=f"Department code '{dept.code}' already exists.")
    doc = dept.dict()
    res = await col.insert_one(doc)
    doc["_id"] = res.inserted_id
    await record_audit_log(current_user["_id"], current_user["name"], current_user["role"], "CREATE_DEPARTMENT", "departments", res.inserted_id)
    return doc

@router.get("/classes")
async def list_classes(department_id: Optional[str] = None):
    classes_col = get_collection("classes")
    dept_col = get_collection("departments")
    tutors_col = get_collection("tutors")
    students_col = get_collection("students")
    
    query = {}
    if department_id:
        query["department_id"] = department_id
    classes = await classes_col.find(query, sort=[("name", 1)])
    
    res = []
    for c in classes:
        dept = await dept_col.find_one({"_id": c.get("department_id")})
        tutor = await tutors_col.find_one({"_id": c.get("tutor_in_charge_id")}) if c.get("tutor_in_charge_id") else None
        total_students = await students_col.count_documents({"class_id": c["_id"]})
        
        c_copy = dict(c)
        c_copy["department_name"] = dept.get("name") if dept else ""
        c_copy["tutor_name"] = tutor.get("name") if tutor else "Not Assigned"
        c_copy["total_students"] = total_students
        res.append(c_copy)
    return res

@router.post("/classes")
async def create_class(class_data: ClassCreate, current_user: dict = Depends(require_roles(["admin"]))):
    col = get_collection("classes")
    doc = class_data.dict()
    res = await col.insert_one(doc)
    doc["_id"] = res.inserted_id
    await record_audit_log(current_user["_id"], current_user["name"], current_user["role"], "CREATE_CLASS", "classes", res.inserted_id)
    return doc

@router.get("/classes/{class_id}/students")
async def get_class_students(class_id: str):
    students_col = get_collection("students")
    return await students_col.find({"class_id": class_id, "status": "ACTIVE"}, sort=[("register_number", 1)])

@router.get("/subjects")
async def list_subjects(class_id: Optional[str] = None, tutor_id: Optional[str] = None):
    subjects_col = get_collection("subjects")
    classes_col = get_collection("classes")
    tutors_col = get_collection("tutors")
    
    query = {}
    if class_id:
        query["class_id"] = class_id
    if tutor_id:
        query["tutor_id"] = tutor_id
        
    subs = await subjects_col.find(query, sort=[("name", 1)])
    res = []
    for s in subs:
        c = await classes_col.find_one({"_id": s.get("class_id")})
        t = await tutors_col.find_one({"_id": s.get("tutor_id")}) if s.get("tutor_id") else None
        s_copy = dict(s)
        s_copy["class_name"] = c.get("name") if c else ""
        s_copy["tutor_name"] = t.get("name") if t else "Unassigned"
        res.append(s_copy)
    return res

@router.post("/subjects")
async def create_subject(subject_data: SubjectCreate, current_user: dict = Depends(require_roles(["admin"]))):
    col = get_collection("subjects")
    doc = subject_data.dict()
    res = await col.insert_one(doc)
    doc["_id"] = res.inserted_id
    await record_audit_log(current_user["_id"], current_user["name"], current_user["role"], "CREATE_SUBJECT", "subjects", res.inserted_id)
    return doc
