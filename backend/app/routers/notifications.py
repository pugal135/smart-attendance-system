from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_collection
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def get_my_notifications(current_user: dict = Depends(get_current_user)):
    col = get_collection("notifications")
    return await col.find({"user_id": current_user["_id"]}, sort=[("created_at", -1)], limit=50)

@router.patch("/{notif_id}/read")
async def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    col = get_collection("notifications")
    await col.update_one({"_id": notif_id, "user_id": current_user["_id"]}, {"$set": {"read": True}})
    return {"message": "Notification marked as read"}

@router.patch("/mark-all-read")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    col = get_collection("notifications")
    await col.update_many({"user_id": current_user["_id"]}, {"$set": {"read": True}})
    return {"message": "All notifications marked as read"}
