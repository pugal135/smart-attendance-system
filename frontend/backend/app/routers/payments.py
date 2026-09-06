from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_collection
from app.models.fine import PaymentCreateOrder, PaymentVerify
from app.services.auth_service import require_roles, get_current_user
from app.services.payment_gateway import create_fine_payment_order, verify_fine_payment

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-order")
async def initiate_payment(
    data: PaymentCreateOrder,
    current_user: dict = Depends(require_roles(["student"]))
):
    st = await get_collection("students").find_one({"user_id": current_user["_id"]})
    if not st:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    try:
        order = await create_fine_payment_order(data.fine_id, st["_id"], data.payment_method)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify")
async def verify_payment(
    data: PaymentVerify,
    current_user: dict = Depends(require_roles(["student"]))
):
    try:
        result = await verify_fine_payment(
            fine_id=data.fine_id,
            order_id=data.order_id,
            transaction_ref=data.transaction_ref,
            payment_method=data.payment_method,
            current_user=current_user
        )
        return {"success": True, "message": "Payment verified successfully", "payment": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
