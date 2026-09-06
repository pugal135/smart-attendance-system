from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from app.database import get_collection
from app.models.fine import FineResponse
from app.services.auth_service import require_roles, get_current_user
from app.services.fine_engine import evaluate_and_generate_student_fine

router = APIRouter(prefix="/fines", tags=["Fines & Penalties"])

@router.get("")
async def list_fines(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    fines_col = get_collection("fines")
    query = {}
    
    if current_user["role"] == "student":
        st = await get_collection("students").find_one({"user_id": current_user["_id"]})
        if not st:
            return []
        query["student_id"] = st["_id"]
    elif current_user["role"] == "parent":
        pa = await get_collection("parents").find_one({"user_id": current_user["_id"]})
        if not pa:
            return []
        wards = await get_collection("students").find({"parent_id": pa["_id"]})
        ward_ids = [w["_id"] for w in wards]
        query["student_id"] = {"$in": ward_ids}
        
    if status_filter:
        query["status"] = status_filter.upper()
        
    return await fines_col.find(query, sort=[("created_at", -1)])

@router.post("/evaluate-all")
async def evaluate_all_students_fines(current_user: dict = Depends(require_roles(["admin"]))):
    students_col = get_collection("students")
    students = await students_col.find({"status": "ACTIVE"})
    
    generated = 0
    for s in students:
        fine = await evaluate_and_generate_student_fine(s["_id"])
        if fine:
            generated += 1
    return {"message": f"Evaluation complete. Generated/Updated fines for {generated} students."}
