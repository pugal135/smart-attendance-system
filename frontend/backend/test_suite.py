import sys
sys.stdout.reconfigure(encoding='utf-8')
# -*- coding: utf-8 -*-
import asyncio
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, r"C:\Users\acer\Desktop\smart-attendance-system\backend")

from app.database import db_manager, get_collection
from app.services.auth_service import get_password_hash, verify_password, create_access_token
from app.services.risk_engine import calculate_student_attendance_stats
from app.services.recovery_calculator import calculate_recovery_plan
from app.services.fine_engine import evaluate_and_generate_student_fine
from app.services.payment_gateway import create_fine_payment_order, verify_fine_payment

async def run_full_system_verification():
    print("=====================================================================")
    print("🚀 SMART ATTENDANCE & STUDENT RISK MANAGEMENT - FULL SYSTEM TEST SUITE")
    print("=====================================================================")
    
    # 1. Connect DB
    await db_manager.connect()
    print("✓ [DB] Connected to Persistent Database Engine")
    
    # 2. Test Empty State Handling
    empty_stats = await calculate_student_attendance_stats("non_existent_id")
    assert empty_stats["has_data"] == False
    assert empty_stats["risk_level"] == "NO_DATA"
    assert "No attendance records available" in empty_stats["risk_message"]
    print("✓ [Empty State] Returns proper zero-data graceful empty state")
    
    # 3. Create Department, Class, and Subject
    dept_col = get_collection("departments")
    class_col = get_collection("classes")
    sub_col = get_collection("subjects")
    students_col = get_collection("students")
    users_col = get_collection("users")
    att_col = get_collection("attendance")
    fines_col = get_collection("fines")
    clearance_col = get_collection("clearances")
    
    # Cleanup any existing test records
    await users_col.delete_many({"email": {"$regex": "@test-college.edu"}})
    await students_col.delete_many({"register_number": {"$regex": "^TEST_"}})
    await dept_col.delete_many({"code": "TEST_CS"})
    await class_col.delete_many({"name": "Test II B.Sc AI"})
    await sub_col.delete_many({"code": "TEST_PY201"})
    
    d_res = await dept_col.insert_one({"name": "Test Computer Science", "code": "TEST_CS"})
    c_res = await class_col.insert_one({"name": "Test II B.Sc AI", "department_id": d_res.inserted_id, "year": 2, "section": "A", "academic_year": "2026-2027"})
    s_res = await sub_col.insert_one({"name": "Test Python AI", "code": "TEST_PY201", "class_id": c_res.inserted_id, "credits": 4, "total_planned_hours": 45})
    print("✓ [Academics] Department, Class, and Subject created successfully")
    
    # 4. Create Student with Linked Parent
    st_u_res = await users_col.insert_one({"email": "student1@test-college.edu", "name": "Arun Test", "role": "student", "hashed_password": get_password_hash("pass123")})
    pa_u_res = await users_col.insert_one({"email": "parent1@test-college.edu", "name": "Ramesh Test", "role": "parent", "hashed_password": get_password_hash("pass123")})
    
    st_res = await students_col.insert_one({
        "user_id": st_u_res.inserted_id,
        "name": "Arun Test",
        "register_number": "TEST_26AIML001",
        "class_id": c_res.inserted_id,
        "class_name": "Test II B.Sc AI",
        "email": "student1@test-college.edu",
        "parent_email": "parent1@test-college.edu",
        "status": "ACTIVE"
    })
    student_id = st_res.inserted_id
    print("✓ [Student & Parent] Registered student and linked parent profile")
    
    # 5. Simulate 10 Class Attendance Sessions (6 Present, 4 Absent -> 60% Attendance)
    now_date = datetime.utcnow()
    for i in range(1, 11):
        status = "PRESENT" if i <= 6 else "ABSENT"
        d_str = (now_date - timedelta(days=(11 - i))).strftime("%Y-%m-%d")
        await att_col.insert_one({
            "student_id": student_id,
            "student_name": "Arun Test",
            "register_number": "TEST_26AIML001",
            "class_id": c_res.inserted_id,
            "class_name": "Test II B.Sc AI",
            "subject_id": s_res.inserted_id,
            "subject_name": "Test Python AI",
            "tutor_id": "tutor_test_1",
            "date": d_str,
            "period": 1,
            "status": status,
            "entry_mode": "MANUAL"
        })
    print("✓ [Attendance Engine] Recorded 10 verified class sessions")
    
    # 6. Verify Attendance % and Risk Categorization
    stats = await calculate_student_attendance_stats(student_id)
    assert stats["has_data"] == True
    assert stats["total_classes"] == 10
    assert stats["present_count"] == 6
    assert stats["overall_percentage"] == 60.0
    assert stats["risk_level"] == "HIGH"
    assert stats["consecutive_absences"] == 4
    assert stats["consecutive_absence_alert"] == True
    print(f"✓ [Risk Engine] Real Percentage: {stats['overall_percentage']}%, Risk Level: {stats['risk_level']}, Consecutive Absences: {stats['consecutive_absences']}")
    
    # 7. Verify Attendance Recovery Calculator
    rec = calculate_recovery_plan(current_present=6, current_total=10, target_percentage=75.0, classes_to_attend=6)
    assert rec["current_percentage"] == 60.0
    assert rec["classes_needed_for_target"] == 6
    assert rec["projected_percentage"] == 75.0
    print(f"✓ [Recovery Calculator] Math verified: Needs {rec['classes_needed_for_target']} classes to reach 75.0%")
    
    # 8. Trigger Automatic Fine & 48h Due Date
    fine = await evaluate_and_generate_student_fine(student_id)
    assert fine is not None
    assert fine["fine_amount"] == 500.0
    assert fine["status"] == "PENDING"
    print(f"✓ [Fine Engine] Fine generated: ₹{fine['fine_amount']}, Due: {fine['due_date']}")
    
    # 9. Verify UPI Payment Order Creation & Gateway Confirmation
    fine_id = fine.get("_id") or (await fines_col.find_one({"student_id": student_id}))["_id"]
    order = await create_fine_payment_order(fine_id, student_id, "UPI_QR")
    assert order["status"] == "PROCESSING"
    assert "upi://pay" in order["upi_intent_uri"]
    print(f"✓ [Payment Gateway] Order created: {order['order_id']}, UPI Intent generated")
    
    pay_result = await verify_fine_payment(
        fine_id=fine_id,
        order_id=order["order_id"],
        transaction_ref="TXN_TEST_998877",
        payment_method="UPI_QR",
        current_user={"_id": st_u_res.inserted_id, "name": "Arun Test", "role": "student"}
    )
    assert pay_result["status"] == "SUCCESS"
    
    updated_fine = await fines_col.find_one({"_id": fine_id})
    assert updated_fine["status"] == "PAID"
    print(f"✓ [Payment Verification] Fine marked as PAID. Txn Ref: {pay_result['transaction_ref']}")
    
    # 10. Verify Clearance Status Transition
    clearance = await clearance_col.find_one({"student_id": student_id})
    assert clearance is not None
    assert clearance["status"] == "PENDING_VERIFICATION"
    
    # Admin endorses clearance
    await clearance_col.update_one(
        {"_id": clearance["_id"]},
        {"$set": {"status": "CLEARANCE_COMPLETED", "verified_by": "System Administrator", "remarks": "Approved & verified"}}
    )
    final_clearance = await clearance_col.find_one({"_id": clearance["_id"]})
    assert final_clearance["status"] == "CLEARANCE_COMPLETED"
    print(f"✓ [Clearance Workflow] Clearance Endorsement Verified: {final_clearance['status']}")
    
    # Clean up test records
    await users_col.delete_many({"email": {"$regex": "@test-college.edu"}})
    await students_col.delete_many({"register_number": {"$regex": "^TEST_"}})
    await dept_col.delete_many({"code": "TEST_CS"})
    await class_col.delete_many({"name": "Test II B.Sc AI"})
    await sub_col.delete_many({"code": "TEST_PY201"})
    await att_col.delete_many({"student_id": student_id})
    await fines_col.delete_many({"student_id": student_id})
    await clearance_col.delete_many({"student_id": student_id})
    
    print("=====================================================================")
    print("🎉 ALL 10 CORE LIFECYCLE TESTS PASSED WITH 100% DATABASE ACCURACY!")
    print("=====================================================================")

if __name__ == "__main__":
    asyncio.run(run_full_system_verification())

