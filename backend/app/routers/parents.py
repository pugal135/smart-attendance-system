from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.database import get_collection
from app.services.auth_service import require_roles, get_current_user

router = APIRouter(prefix="/parents", tags=["Parents"])

@router.get("")
async def list_parents(current_user: dict = Depends(require_roles(["admin"]))):
    parents_col = get_collection("parents")
    return await parents_col.find({}, sort=[("name", 1)])

@router.get("/my-wards")
async def get_parent_wards(current_user: dict = Depends(require_roles(["parent"]))):
    parents_col = get_collection("parents")
    students_col = get_collection("students")
    classes_col = get_collection("classes")
    
    parent = await parents_col.find_one({"user_id": current_user["_id"]})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")
        
    student_ids = parent.get("student_ids", [])
    wards = await students_col.find({"$or": [{"_id": {"$in": student_ids}}, {"parent_id": parent["_id"]}]})
    
    res = []
    for w in wards:
        c = await classes_col.find_one({"_id": w.get("class_id")})
        w_copy = dict(w)
        w_copy["class_name"] = c.get("name") if c else ""
        res.append(w_copy)
    return res
