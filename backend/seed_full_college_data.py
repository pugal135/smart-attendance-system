import asyncio
import os
import sys
import csv
from datetime import datetime, timedelta

sys.stdout.reconfigure(line_buffering=True)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import db_manager, get_collection
from app.services.auth_service import get_password_hash
from app.services.fine_engine import evaluate_and_generate_student_fine

BOY_NAMES = [
    ("Arun Kumar", "Ramesh Kumar"), ("Vignesh", "Mani"), ("Dinesh Kumar", "Ganesan"),
    ("Sanjay", "Natarajan"), ("Harish Raghav", "Arumugam"), ("Manoj Kumar", "Annamalai"),
    ("Naveen Prasath", "Ramanathan"), ("Gokulnath", "Palanisamy"), ("Karthikeyan", "Jayaraman"),
    ("Vigneshwaran", "Elango"), ("Ashwin Soundar", "Soundararajan"), ("Siddharth", "Kumaravel"),
    ("Ragav", "Vasudevan"), ("Mukesh", "Thirumalai"), ("Aravind", "Govindaraj"),
    ("Praveen", "Palanivel"), ("Chandru", "Chandrasekhar"), ("Deepak", "Devarajan"),
    ("Balaji", "Baskar"), ("Rajesh", "Ramasamy"), ("Suresh", "Subbarayan"),
    ("Kishore", "Kandasamy"), ("Ajay", "Aruldas"), ("Rahul", "Ravi Shankar"),
    ("Surya", "Saminathan"), ("Pradeep", "Perumal"), ("Gopinath", "Gopalakrishnan"),
    ("Saravanan", "Subramani"), ("Madhan", "Mathivanan"), ("Vetrivel", "Velu")
]

GIRL_NAMES = [
    ("Priya Dharshini", "Sundaram"), ("Kavitha", "Radhakrishnan"), ("Ananya Sri", "Thangavel"),
    ("Divya Bharathi", "Balan"), ("Keerthana", "Velmurugan"), ("Deepa Lakshmi", "Krishnan"),
    ("Swetha", "Selvam"), ("Sneha", "Muthukumar"), ("Pavithra", "Chandran"),
    ("Abinaya", "Durairaj"), ("Lavanya", "Loganathan"), ("Harini", "Rajendran"),
    ("Gayathri", "Panneerselvam"), ("Sandhya", "Nagarajan"), ("Yamuna", "Mohan"),
    ("Janani", "Jayakumar"), ("Ramya", "Rajendran"), ("Kaviya", "Krishnan"),
    ("Vaishnavi", "Venkatesan"), ("Menaka", "Murugesan"), ("Roshini", "Ranganathan"),
    ("Bhuvaneshwari", "Boopalan"), ("Preethi", "Pandian"), ("Archana", "Alagappan"),
    ("Shalini", "Selvaraj"), ("Mythili", "Manoharan"), ("Anitha", "Appasamy"),
    ("Nandhini", "Neelamegam"), ("Mahalakshmi", "Madhavan"), ("Revathi", "Ramalingam")
]

INITIALS = ["K.", "S.", "M.", "R.", "G.", "T.", "N.", "B.", "A.", "V.", "P.", "J.", "C.", "E.", "D.", "L.", "H.", "Y."]

CLASSES_DEF = [
    {"name": "1st B.Sc AI & ML", "dept_code": "AI&ML", "year": 1, "sec": "A", "prefix": "26AIML", "tutor_name": "Prof. S. Rajesh", "tutor_email": "tutor123@gmail.com", "tutor_id_code": "TUT_AIML_01", "tutor_deg": "Associate Professor & Head", "tutor_pass": "tutor123"},
    {"name": "2nd B.Sc AI & ML", "dept_code": "AI&ML", "year": 2, "sec": "A", "prefix": "25AIML", "tutor_name": "Dr. A. Meenakshi", "tutor_email": "meenakshi.faculty@college.edu", "tutor_id_code": "TUT_AIML_02", "tutor_deg": "Assistant Professor", "tutor_pass": "Meenakshi@AIML2"},
    {"name": "3rd B.Sc AI & ML", "dept_code": "AI&ML", "year": 3, "sec": "A", "prefix": "24AIML", "tutor_name": "Prof. M. Saravanan", "tutor_email": "saravanan.faculty@college.edu", "tutor_id_code": "TUT_AIML_03", "tutor_deg": "Assistant Professor", "tutor_pass": "Saravanan@AIML3"},
    {"name": "1st BCA", "dept_code": "BCA", "year": 1, "sec": "A", "prefix": "26BCA", "tutor_name": "Dr. M. Deepa", "tutor_email": "deepa.faculty@college.edu", "tutor_id_code": "TUT_BCA_01", "tutor_deg": "Assistant Professor & Head", "tutor_pass": "Deepa@BCA1"},
    {"name": "2nd BCA", "dept_code": "BCA", "year": 2, "sec": "A", "prefix": "25BCA", "tutor_name": "Prof. P. Suresh", "tutor_email": "suresh.faculty@college.edu", "tutor_id_code": "TUT_BCA_02", "tutor_deg": "Assistant Professor", "tutor_pass": "Suresh@BCA2"},
    {"name": "3rd BCA", "dept_code": "BCA", "year": 3, "sec": "A", "prefix": "24BCA", "tutor_name": "Dr. K. Geetha", "tutor_email": "geetha.faculty@college.edu", "tutor_id_code": "TUT_BCA_03", "tutor_deg": "Assistant Professor", "tutor_pass": "Geetha@BCA3"},
    {"name": "1st B.Sc Computer Science", "dept_code": "CS", "year": 1, "sec": "A", "prefix": "26CS", "tutor_name": "Prof. V. Karthik", "tutor_email": "karthik.faculty@college.edu", "tutor_id_code": "TUT_CS_01", "tutor_deg": "Assistant Professor & Head", "tutor_pass": "Karthik@CS1"},
    {"name": "2nd B.Sc Computer Science", "dept_code": "CS", "year": 2, "sec": "A", "prefix": "25CS", "tutor_name": "Prof. R. Vijay", "tutor_email": "vijay.faculty@college.edu", "tutor_id_code": "TUT_CS_02", "tutor_deg": "Assistant Professor", "tutor_pass": "Vijay@CS2"},
    {"name": "3rd B.Sc Computer Science", "dept_code": "CS", "year": 3, "sec": "A", "prefix": "24CS", "tutor_name": "Dr. S. Balamurugan", "tutor_email": "balamurugan.faculty@college.edu", "tutor_id_code": "TUT_CS_03", "tutor_deg": "Assistant Professor", "tutor_pass": "Balamurugan@CS3"}
]

async def seed_full_college():
    print("[1/7] Connecting to database engine...", flush=True)
    await db_manager.connect()

    credentials_export = []

    for c in ["users", "students", "parents", "tutors", "classes", "departments", "subjects", "attendance", "leaves", "fines", "clearances", "notifications", "audit_logs", "payments", "settings"]:
        await get_collection(c).delete_many({})
    print("[2/7] Cleared previous database collections.", flush=True)

    # 1. Settings
    await get_collection("settings").insert_one({
        "college_name": "Smart College of Arts & Science",
        "college_code": "SCAS-2026",
        "required_attendance_percentage": 75.0,
        "high_risk_threshold": 65.0,
        "fine_amount_per_shortage": 500.0,
        "fine_due_days": 2,
        "consecutive_absence_alert_count": 3,
        "upi_payee_address": "7708881295@ptyes",
        "upi_payee_name": "Smart_College_Academic_Portal",
        "enable_email_alerts": True,
        "enable_sms_alerts": True,
        "academic_year": "2026-2027"
    })

    # 2. Admin
    users_col = get_collection("users")
    admin_pass = "admin123"
    admin_hash = get_password_hash(admin_pass)
    await users_col.insert_one({
        "email": "admin@college.edu",
        "name": "Dr. K. S. Ramanathan (Principal & Admin)",
        "role": "admin",
        "phone": "+91 98400 11223",
        "hashed_password": admin_hash,
        "is_active": True
    })
    credentials_export.append({"Role": "Admin", "Department/Class": "Administration", "Name": "Dr. K. S. Ramanathan", "Username/Email": "admin@college.edu", "Alternative ID": "ADMIN-01", "Password": admin_pass})

    # 3. Departments
    dept_col = get_collection("departments")
    depts_data = [
        {"name": "Department of Artificial Intelligence & Machine Learning", "code": "AI&ML", "description": "B.Sc AI & Machine Learning Programs"},
        {"name": "Department of Computer Applications", "code": "BCA", "description": "Bachelor of Computer Applications Programs"},
        {"name": "Department of Computer Science", "code": "CS", "description": "B.Sc Computer Science Programs"}
    ]
    dept_map = {}
    for d in depts_data:
        res = await dept_col.insert_one(d)
        dept_map[d["code"]] = res.inserted_id

    # 4. Tutors (9 dedicated tutors with unique passwords)
    tutors_col = get_collection("tutors")
    tutor_map = {}
    for c_def in CLASSES_DEF:
        t_pass = c_def["tutor_pass"]
        t_hash = get_password_hash(t_pass)
        u_doc = {
            "email": c_def["tutor_email"],
            "name": c_def["tutor_name"],
            "role": "tutor",
            "phone": f"+91 94441 5566{CLASSES_DEF.index(c_def) + 1}",
            "hashed_password": t_hash,
            "is_active": True
        }
        u_res = await users_col.insert_one(u_doc)
        t_doc = {
            "user_id": u_res.inserted_id,
            "name": c_def["tutor_name"],
            "employee_id": c_def["tutor_id_code"],
            "email": c_def["tutor_email"],
            "phone": u_doc["phone"],
            "department_id": dept_map[c_def["dept_code"]],
            "designation": c_def["tutor_deg"],
            "qualification": "M.Tech / Ph.D",
            "assigned_class_ids": [],
            "assigned_subject_ids": []
        }
        t_res = await tutors_col.insert_one(t_doc)
        tutor_map[c_def["tutor_email"]] = t_res.inserted_id
        credentials_export.append({"Role": "Tutor", "Department/Class": c_def["name"], "Name": c_def["tutor_name"], "Username/Email": c_def["tutor_email"], "Alternative ID": c_def["tutor_id_code"], "Password": t_pass})

    print(f"[3/7] Created 9 dedicated tutors with unique passwords (1 per class).", flush=True)

    # 5. Classes
    classes_col = get_collection("classes")
    class_map = {}
    for c_def in CLASSES_DEF:
        t_id = tutor_map[c_def["tutor_email"]]
        c_doc = {
            "department_id": dept_map[c_def["dept_code"]],
            "name": c_def["name"],
            "year": c_def["year"],
            "section": c_def["sec"],
            "academic_year": "2026-2027",
            "tutor_in_charge_id": t_id,
            "total_students": 30
        }
        res = await classes_col.insert_one(c_doc)
        class_id = res.inserted_id
        class_map[c_def["name"]] = class_id
        await tutors_col.update_one({"_id": t_id}, {"$push": {"assigned_class_ids": class_id}})

    # 6. Subjects (3 subjects per class)
    subjects_col = get_collection("subjects")
    subject_map = {}
    subject_templates = {
        "AI&ML": [("Python for AI & Data Science", "AI101"), ("Machine Learning Algorithms", "AI102"), ("Deep Learning & Neural Networks", "AI103")],
        "BCA": [("Object-Oriented Programming (Java)", "BCA101"), ("Database Management Systems & SQL", "BCA102"), ("Web Application Development", "BCA103")],
        "CS": [("Data Structures & Algorithms in C++", "CS101"), ("Operating Systems & Linux Shell", "CS102"), ("Computer Networks & Cloud Systems", "CS103")]
    }

    for c_def in CLASSES_DEF:
        c_name = c_def["name"]
        c_id = class_map[c_name]
        t_id = tutor_map[c_def["tutor_email"]]
        subject_map[c_name] = []
        for sub_name, sub_code_base in subject_templates[c_def["dept_code"]]:
            s_doc = {
                "class_id": c_id,
                "name": f"{sub_name} (Yr {c_def['year']})",
                "code": f"{sub_code_base}-{c_def['year']}Y",
                "tutor_id": t_id,
                "credits": 4,
                "total_planned_hours": 45
            }
            s_res = await subjects_col.insert_one(s_doc)
            s_doc["_id"] = s_res.inserted_id
            subject_map[c_name].append(s_doc)
            await tutors_col.update_one({"_id": t_id}, {"$push": {"assigned_subject_ids": s_res.inserted_id}})

    # 7. Seed 30 Students per class (15 boys + 15 girls) with linked Parents
    students_col = get_collection("students")
    parents_col = get_collection("parents")
    class_student_map = {}
    all_shortage_student_ids = []

    print("[4/7] Seeding 30 Students per Class (270 Students total) with Parent Links...", flush=True)

    for class_idx, c_def in enumerate(CLASSES_DEF):
        c_name = c_def["name"]
        c_id = class_map[c_name]
        prefix = c_def["prefix"]
        class_student_map[c_name] = []

        # 15 boys + 15 girls
        for s_idx in range(1, 31):
            is_boy = (s_idx % 2 == 1)
            name_pool = BOY_NAMES if is_boy else GIRL_NAMES
            pool_item = name_pool[(s_idx // 2 + class_idx * 3) % len(name_pool)]
            init = INITIALS[(s_idx + class_idx) % len(INITIALS)]
            st_raw_name, pr_raw_name = pool_item
            st_name = f"{init} {st_raw_name}"
            pr_name = f"Mr. {pr_raw_name}"
            reg_no = f"{prefix}{s_idx:03d}"
            roll_no = f"{prefix}-{s_idx:02d}"

            if c_name == "1st B.Sc AI & ML" and s_idx == 1:
                st_name = "K. Arun Kumar"
                st_email = "student123@gmail.com"
                st_pass = "student123"
                pr_name = "Mr. Ramesh Kumar"
                pr_email = "father133@gmail.com"
                pr_pass = "mother123"
                is_shortage = True
            else:
                clean_name = st_raw_name.split()[0].lower()
                st_email = f"{clean_name}.{reg_no.lower()}@college.edu"
                st_pass = f"Pass@{reg_no}"
                clean_pr_name = pr_raw_name.split()[0].lower()
                pr_email = f"{clean_pr_name}.{reg_no.lower()}@gmail.com"
                pr_pass = f"Parent@{reg_no}"
                is_shortage = (s_idx in [3, 7, 13, 21, 27])

            st_pass_hash = get_password_hash(st_pass)
            pr_pass_hash = get_password_hash(pr_pass)

            # Student user
            st_u_doc = {
                "email": st_email,
                "name": st_name,
                "role": "student",
                "phone": f"+91 98401 {s_idx:02d}{class_idx:02d}1",
                "hashed_password": st_pass_hash,
                "is_active": True
            }
            st_u_res = await users_col.insert_one(st_u_doc)
            st_user_id = st_u_res.inserted_id

            # Parent user
            pr_u_doc = {
                "email": pr_email,
                "name": pr_name,
                "role": "parent",
                "phone": f"+91 94441 {s_idx:02d}{class_idx:02d}2",
                "hashed_password": pr_pass_hash,
                "is_active": True
            }
            pr_u_res = await users_col.insert_one(pr_u_doc)
            pr_user_id = pr_u_res.inserted_id

            # Parent profile
            pr_doc = {
                "user_id": pr_user_id,
                "name": pr_name,
                "email": pr_email,
                "phone": pr_u_doc["phone"],
                "student_ids": [],
                "relationship": "Father"
            }
            pr_res = await parents_col.insert_one(pr_doc)
            parent_id = pr_res.inserted_id

            # Student profile
            st_doc = {
                "user_id": st_user_id,
                "name": st_name,
                "register_number": reg_no,
                "roll_no": roll_no,
                "email": st_email,
                "phone": st_u_doc["phone"],
                "gender": "Male" if is_boy else "Female",
                "class_id": c_id,
                "class_name": c_name,
                "parent_id": parent_id,
                "parent_name": pr_name,
                "parent_email": pr_email,
                "parent_phone": pr_u_doc["phone"],
                "address": f"No. {s_idx * 5}, Anna Nagar, Chennai - 600040",
                "date_of_birth": f"200{6 - c_def['year'] + 1}-05-15",
                "status": "ACTIVE",
                "_is_shortage_target": is_shortage
            }
            st_res = await students_col.insert_one(st_doc)
            student_id = st_res.inserted_id
            st_doc["_id"] = student_id

            await parents_col.update_one({"_id": parent_id}, {"$push": {"student_ids": student_id}})
            class_student_map[c_name].append(st_doc)
            if is_shortage:
                all_shortage_student_ids.append(student_id)

            credentials_export.append({"Role": "Student", "Department/Class": c_name, "Name": st_name, "Username/Email": st_email, "Alternative ID": reg_no, "Password": st_pass})
            credentials_export.append({"Role": "Parent", "Department/Class": f"{c_name} (Ward: {reg_no})", "Name": pr_name, "Username/Email": pr_email, "Alternative ID": f"Parent-{reg_no}", "Password": pr_pass})

    print(f"[5/7] Seeded 270 students with unique passwords across 9 classes. Shortage targets: {len(all_shortage_student_ids)}", flush=True)

    # 8. Real Attendance Sessions
    print("[6/7] Generating real lecture attendance records across all subjects...", flush=True)
    att_col = get_collection("attendance")
    attendance_records = []
    base_date = datetime.now() - timedelta(days=20)

    for c_def in CLASSES_DEF:
        c_name = c_def["name"]
        c_id = class_map[c_name]
        subs = subject_map[c_name]
        t_id = tutor_map[c_def["tutor_email"]]
        students_in_class = class_student_map[c_name]

        for session_num in range(15):
            cur_date = (base_date + timedelta(days=session_num + 1)).strftime("%Y-%m-%d")
            period = (session_num % 4) + 1
            sub = subs[session_num % len(subs)]

            for student in students_in_class:
                is_shortage = student.get("_is_shortage_target", False)

                if is_shortage:
                    status = "PRESENT" if session_num in [0, 2, 4, 6, 8, 10, 12, 14] else "ABSENT"
                else:
                    status = "PRESENT" if session_num not in [5, 11] else "ABSENT"

                att_doc = {
                    "student_id": student["_id"],
                    "student_name": student["name"],
                    "register_number": student["register_number"],
                    "class_id": c_id,
                    "class_name": c_name,
                    "subject_id": sub["_id"],
                    "subject_name": sub["name"],
                    "tutor_id": t_id,
                    "tutor_name": c_def["tutor_name"],
                    "date": cur_date,
                    "period": period,
                    "status": status,
                    "entry_mode": "MANUAL",
                    "marked_at": f"{cur_date} 09:30:00"
                }
                attendance_records.append(att_doc)

    await att_col.insert_many(attendance_records)
    print(f" -> Inserted {len(attendance_records)} total attendance session records.", flush=True)

    # 9. Trigger Fine Engine for Shortage Students
    print("[7/7] Evaluating risk and generating fines + Paytm UPI payment notices...", flush=True)
    fine_count = 0
    all_students = await students_col.find({})
    for s in all_students:
        fine_res = await evaluate_and_generate_student_fine(s["_id"])
        if fine_res:
            fine_count += 1

    # Save credentials CSV and Markdown
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "credentials_master_list.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Role", "Department/Class", "Name", "Username/Email", "Alternative ID", "Password"])
        writer.writeheader()
        writer.writerows(credentials_export)

    md_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "CREDENTIALS_MASTER_LIST.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# 🎓 Smart Attendance & Student Risk Management System\n\n")
        f.write("## 🔑 Master Credentials Directory (All 9 Tutors, 270 Students, 270 Parents)\n\n")
        f.write("| Role | Department / Class | Name | Login Email / Identifier | Reg / Emp ID | Unique Password |\n")
        f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
        for item in credentials_export:
            f.write(f"| **{item['Role']}** | {item['Department/Class']} | {item['Name']} | `{item['Username/Email']}` | `{item['Alternative ID']}` | `{item['Password']}` |\n")

    print("========================================================================", flush=True)
    print("SUCCESS: 9 Tutors, 270 Students, 270 Parents initialized with UNIQUE Passwords!", flush=True)
    print(f" - Credentials exported to {csv_path} and CREDENTIALS_MASTER_LIST.md", flush=True)
    print("========================================================================", flush=True)

if __name__ == "__main__":
    asyncio.run(seed_full_college())
