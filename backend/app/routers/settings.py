from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_collection
from app.models.setting import SystemSettingsModel
from app.services.auth_service import require_roles, get_current_user
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
async def get_system_settings():
    col = get_collection("settings")
    doc = await col.find_one({})
    if not doc:
        default_settings = SystemSettingsModel().dict()
        res = await col.insert_one(default_settings)
        default_settings["_id"] = res.inserted_id
        return default_settings
    return doc

@router.put("")
async def update_system_settings(
    new_settings: SystemSettingsModel,
    current_user: dict = Depends(require_roles(["admin"]))
):
    col = get_collection("settings")
    existing = await col.find_one({})
    doc = new_settings.dict()
    
    if existing:
        await col.update_one({"_id": existing["_id"]}, {"$set": doc})
    else:
        await col.insert_one(doc)
        
    await record_audit_log(
        actor_id=current_user["_id"],
        actor_name=current_user["name"],
        actor_role=current_user["role"],
        action_type="UPDATE_SETTINGS",
        entity_name="settings",
        details="Updated academic thresholds and fine policies"
    )
    return {"message": "Settings updated successfully", "settings": doc}
