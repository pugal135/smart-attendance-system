# Smart Attendance & Student Risk Management System

> **Tagline:** *"Track Attendance. Predict Risk. Stay Connected."*

A modern, production-grade college attendance and student risk intelligence platform connecting **Admin, Faculty/Tutors, Students, and Parents** through a real-time, zero-dummy-data architecture.

---

## 🌟 Core Architecture & Guiding Philosophy

```
REAL INPUT → DATABASE ENGINE → REAL-TIME ATTENDANCE → ANALYTICS → RISK PREDICTION → AUTOMATIC ALERTS → 48H FINE/CLEARANCE → FORMAL REPORTS
```

* **100% Real Database Calculations**: Every metric, chart percentage, risk forecast, and fine countdown is calculated directly from persistent database documents.
* **Graceful Zero-Data Empty States**: When collections are clean, informative prompts guide users to register departments, classes, students, and faculty.
* **Role-Based Access Scoping**: Strict JWT RBAC guards partition data visibility for Admin, Tutor, Student, and Parent.

---

## 🚀 Quick Start Guide

### One-Click Launch
Double-click `start-all.bat` or run in PowerShell:
```powershell
.\start-all.ps1
```
This automatically starts:
1. **Backend FastAPI API** on `http://127.0.0.1:8000` (Interactive Swagger docs: `/docs`)
2. **Frontend React+Vite UI** on `http://localhost:3000`
3. Automatically opens your default web browser.

---

## 🔑 Default Credentials & Role Matrix

| Role | Default Identifier | Default Password | Scope & Key Capabilities |
|---|---|---|---|
| **Admin** | `admin@college.edu` | `admin123` | College-wide control, curriculum setup, student/tutor management, 48h fine policies, clearance pass endorsements, audit logs, PDF/Excel reports. |
| **Tutor / Faculty** | *(Created by Admin or Tutor Management)* | Custom | Auto-loading class rosters, batch session marking (Present, Absent, Late), dynamic QR code broadcast with live check-in feeds, leave approval queue. |
| **Student** | *(Created in Student Directory)* | Custom | Real-time attendance percentages, recovery simulator, leave application, 48-hour fine countdown clock, UPI QR checkout, clearance pass. |
| **Parent** | *(Auto-created upon student registration)* | Custom | Real-time visibility into linked ward's attendance, period statuses, attendance drop alerts, consecutive absence notices, and fine settlement status. |

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11, FastAPI, Pydantic v2, Motor / PyMongo, Uvicorn, Scikit-learn (academic mark range predictor), ReportLab (PDF generator), Pandas & OpenPyXL.
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti, QRCode.React, Axios.
- **Database**: Dual-mode engine supporting native MongoDB with fallback to an ACID-compliant async JSON document store (`backend/data/app_database.json`).

---

## 🧪 Running Automated Test Suite

To run the automated 10-step lifecycle test suite (validating registration, batch marking, duplicate prevention, risk engine, recovery calculator, 48h fine generation, UPI checkout, and clearance signoff):

```powershell
python backend/test_suite.py
```

---

## 📁 Project Directory Structure

```
smart-attendance-system/
├── backend/
│   ├── app/
│   │   ├── config.py              # System thresholds and SMTP settings
│   │   ├── database.py            # Dual async database engine
│   │   ├── main.py                # FastAPI app lifecycle and seeder
│   │   ├── models/                # Pydantic schemas (User, Attendance, Fines, etc.)
│   │   ├── routers/               # 15 domain REST API routers
│   │   └── services/              # Auth, Risk, Recovery, ML, Fine, Gateway, Reports
│   ├── run.py                     # Backend entry point (Port 8000)
│   └── test_suite.py              # Automated E2E verification test
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios client and service endpoints
│   │   ├── components/            # Common badges, stat cards, modals, QR components, calculators
│   │   ├── context/               # AuthContext and NotificationContext
│   │   ├── pages/                 # Role-based pages (Admin, Tutor, Student, Parent, Landing, Login)
│   │   ├── App.jsx                # Router and RBAC Protected Layouts
│   │   └── index.css              # Dark navy theme and glassmorphism styling
│   └── vite.config.js             # Vite config with API reverse proxy
├── start-all.bat                  # One-click Windows launcher batch script
├── start-all.ps1                  # One-click PowerShell launcher script
└── README.md                      # Comprehensive documentation
```
