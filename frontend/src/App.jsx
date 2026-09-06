import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Navbar } from "./components/common/Navbar";
import { Sidebar } from "./components/common/Sidebar";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { StudentManagement } from "./pages/admin/StudentManagement";
import { TutorManagement } from "./pages/admin/TutorManagement";
import { ClassSubjectManagement } from "./pages/admin/ClassSubjectManagement";
import { RiskMonitor } from "./pages/admin/RiskMonitor";
import { FinesClearance } from "./pages/admin/FinesClearance";
import { AnalyticsReports } from "./pages/admin/AnalyticsReports";
import { AuditTrail } from "./pages/admin/AuditTrail";
import { SystemSettings } from "./pages/admin/SystemSettings";

// Tutor Pages
import { TutorDashboard } from "./pages/tutor/TutorDashboard";
import { MarkAttendance } from "./pages/tutor/MarkAttendance";
import { QRAttendance } from "./pages/tutor/QRAttendance";
import { LeavesApproval } from "./pages/tutor/LeavesApproval";
import { ClassAnalytics } from "./pages/tutor/ClassAnalytics";
import { TutorReports } from "./pages/tutor/TutorReports";

// Student Pages
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { MyAttendance } from "./pages/student/MyAttendance";
import { StudentQRScanner } from "./pages/student/StudentQRScanner";
import { RecoveryCalculatorPage } from "./pages/student/RecoveryCalculatorPage";
import { ApplyLeave } from "./pages/student/ApplyLeave";
import { MyFines } from "./pages/student/MyFines";
import { ClearanceStatus } from "./pages/student/ClearanceStatus";
import { StudentNotifications } from "./pages/student/StudentNotifications";

// Parent Pages
import { ParentDashboard } from "./pages/parent/ParentDashboard";
import { ChildAttendance } from "./pages/parent/ChildAttendance";
import { ChildRiskAlerts } from "./pages/parent/ChildRiskAlerts";
import { ChildLeaveRecords } from "./pages/parent/ChildLeaveRecords";
import { ChildFinesClearance } from "./pages/parent/ChildFinesClearance";

const ProtectedLayout = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060A17] flex items-center justify-center text-indigo-400 font-mono text-sm">
        Initializing Academic System...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return (
    <div className="min-h-screen bg-[#060A17] text-slate-100 flex flex-col">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Dashboard Routes */}
            <Route path="/dashboard/admin" element={<ProtectedLayout allowedRoles={["admin"]} />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="tutors" element={<TutorManagement />} />
              <Route path="classes-subjects" element={<ClassSubjectManagement />} />
              <Route path="risk-monitor" element={<RiskMonitor />} />
              <Route path="fines-clearance" element={<FinesClearance />} />
              <Route path="analytics" element={<AnalyticsReports />} />
              <Route path="audit" element={<AuditTrail />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            {/* Tutor Dashboard Routes */}
            <Route path="/dashboard/tutor" element={<ProtectedLayout allowedRoles={["tutor"]} />}>
              <Route index element={<TutorDashboard />} />
              <Route path="mark-attendance" element={<MarkAttendance />} />
              <Route path="qr-attendance" element={<QRAttendance />} />
              <Route path="leaves" element={<LeavesApproval />} />
              <Route path="class-analytics" element={<ClassAnalytics />} />
              <Route path="reports" element={<TutorReports />} />
            </Route>

            {/* Student Dashboard Routes */}
            <Route path="/dashboard/student" element={<ProtectedLayout allowedRoles={["student"]} />}>
              <Route index element={<StudentDashboard />} />
              <Route path="my-attendance" element={<MyAttendance />} />
              <Route path="qr-scanner" element={<StudentQRScanner />} />
              <Route path="recovery-calc" element={<RecoveryCalculatorPage />} />
              <Route path="apply-leave" element={<ApplyLeave />} />
              <Route path="my-fines" element={<MyFines />} />
              <Route path="clearance-status" element={<ClearanceStatus />} />
              <Route path="notifications" element={<StudentNotifications />} />
            </Route>

            {/* Parent Dashboard Routes */}
            <Route path="/dashboard/parent" element={<ProtectedLayout allowedRoles={["parent"]} />}>
              <Route index element={<ParentDashboard />} />
              <Route path="child-attendance" element={<ChildAttendance />} />
              <Route path="risk-alerts" element={<ChildRiskAlerts />} />
              <Route path="leave-records" element={<ChildLeaveRecords />} />
              <Route path="fines" element={<ChildFinesClearance />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
