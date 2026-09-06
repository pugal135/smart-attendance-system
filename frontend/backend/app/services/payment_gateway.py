import uuid
from datetime import datetime
from typing import Dict, Any
from app.database import get_collection
from app.services.notification_service import create_notification
from app.services.audit_service import record_audit_log

async def create_fine_payment_order(fine_id: str, student_id: str, payment_method: str = "UPI_QR") -> Dict[str, Any]:
    fines_col = get_collection("fines")
    fine = await fines_col.find_one({"_id": fine_id, "student_id": student_id})
    if not fine:
        raise ValueError("Fine record not found")
        
    order_id = f"ORDER_COLLEGE_{uuid.uuid4().hex[:8].upper()}"
    amount = float(fine.get("fine_amount", 500.0))
    
    # UPI standard intent URI
    upi_pa = "college.accounts@sbi"
    upi_pn = "College_Academic_Portal"
    upi_tn = f"Attendance_Fine_{fine.get('register_number', '')}"
    upi_uri = f"upi://pay?pa={upi_pa}&pn={upi_pn}&tr={order_id}&tn={upi_tn}&am={amount:.2f}&cu=INR"
    
    await fines_col.update_one({"_id": fine_id}, {"$set": {"status": "PAYMENT_PROCESSING"}})
    
    return {
        "order_id": order_id,
        "fine_id": fine_id,
        "amount": amount,
        "currency": "INR",
        "upi_intent_uri": upi_uri,
        "payment_method": payment_method,
        "status": "PROCESSING",
        "created_at": datetime.utcnow().isoformat()
    }

async def verify_fine_payment(
    fine_id: str,
    order_id: str,
    transaction_ref: str,
    payment_method: str,
    current_user: Dict[str, Any]
) -> Dict[str, Any]:
    fines_col = get_collection("fines")
    payments_col = get_collection("payments")
    clearance_col = get_collection("clearances")
    
    fine = await fines_col.find_one({"_id": fine_id})
    if not fine:
        raise ValueError("Fine not found")
        
    now = datetime.utcnow().isoformat()
    
    payment_doc = {
        "fine_id": fine_id,
        "student_id": fine.get("student_id"),
        "order_id": order_id,
        "amount": fine.get("fine_amount"),
        "payment_method": payment_method,
        "transaction_ref": transaction_ref,
        "status": "SUCCESS",
        "paid_at": now,
        "created_at": now
    }
    await payments_col.insert_one(payment_doc)
    
    # Mark Fine as PAID
    await fines_col.update_one(
        {"_id": fine_id},
        {"$set": {"status": "PAID", "paid_at": now, "transaction_ref": transaction_ref}}
    )
    
    # Update Clearance status to PENDING_VERIFICATION (ready for Admin signature)
    await clearance_col.update_one(
        {"student_id": fine.get("student_id")},
        {"$set": {
            "status": "PENDING_VERIFICATION",
            "fine_id": fine_id,
            "remarks": "Payment confirmed via gateway. Awaiting Admin clearance endorsement."
        }},
        upsert=True
    )
    
    # Notify Student
    await create_notification(
        user_id=current_user.get("_id"),
        title="Payment Successful",
        message=f"Fine payment of ?{fine.get('fine_amount')} confirmed (Txn: {transaction_ref}). Clearance submitted for Admin verification.",
        notif_type="PAYMENT_CONFIRMED",
        meta_data={"fine_id": fine_id, "txn": transaction_ref}
    )
    
    await record_audit_log(
        actor_id=current_user.get("_id"),
        actor_name=current_user.get("name"),
        actor_role=current_user.get("role"),
        action_type="PAYMENT_CONFIRMED",
        entity_name="fines",
        entity_id=fine_id,
        details=f"Fine payment verified with Txn {transaction_ref}"
    )
    
    return payment_doc
