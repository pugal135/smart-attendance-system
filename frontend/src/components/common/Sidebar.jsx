import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  QrCode,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  FileCheck2,
  History,
  Sliders,
  Calculator,
  UserCheck,
  Award,
  BellRing,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import clsx from "clsx";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const menuConfig = {
    admin: [
      { name: "Command Center", path: "/dashboard/admin", icon: LayoutDashboard },
      { name: "Students & Parents", path: "/dashboard/admin/students", icon: Users },
      { name: "Faculty / Tutors", path: "/dashboard/admin/tutors", icon: GraduationCap },
      { name: "Classes & Subjects", path: "/dashboard/admin/classes-subjects", icon: BookOpen },
      { name: "Risk Monitor", path: "/dashboard/admin/risk-monitor", icon: AlertTriangle },
      { name: "Fines & Clearance", path: "/dashboard/admin/fines-clearance", icon: Receipt },
      { name: "Deep Analytics", path: "/dashboard/admin/analytics", icon: FileSpreadsheet },
      { name: "Audit Trail", path: "/dashboard/admin/audit", icon: History },
      { name: "System Settings", path: "/dashboard/admin/settings", icon: Sliders },
    ],
    tutor: [
      { name: "Faculty Dashboard", path: "/dashboard/tutor", icon: LayoutDashboard },
      { name: "Mark Attendance", path: "/dashboard/tutor/mark-attendance", icon: CalendarCheck2 },
      { name: "Live QR Session", path: "/dashboard/tutor/qr-attendance", icon: QrCode },
      { name: "Leave Approvals", path: "/dashboard/tutor/leaves", icon: UserCheck },
      { name: "Class Risk & Analytics", path: "/dashboard/tutor/class-analytics", icon: AlertTriangle },
      { name: "Reports Export", path: "/dashboard/tutor/reports", icon: FileSpreadsheet },
    ],
    student: [
      { name: "My Dashboard", path: "/dashboard/student", icon: LayoutDashboard },
      { name: "Attendance Log", path: "/dashboard/student/my-attendance", icon: CalendarCheck2 },
      { name: "QR Check-in", path: "/dashboard/student/qr-scanner", icon: QrCode },
      { name: "Recovery Calculator", path: "/dashboard/student/recovery-calc", icon: Calculator },
      { name: "Apply Leave", path: "/dashboard/student/apply-leave", icon: UserCheck },
      { name: "Fines & Dues", path: "/dashboard/student/my-fines", icon: Receipt },
      { name: "Clearance Certificate", path: "/dashboard/student/clearance-status", icon: Award },
      { name: "Alerts & Notices", path: "/dashboard/student/notifications", icon: BellRing },
    ],
    parent: [
      { name: "Parent Overview", path: "/dashboard/parent", icon: LayoutDashboard },
      { name: "Ward Attendance", path: "/dashboard/parent/child-attendance", icon: CalendarCheck2 },
      { name: "Risk Warnings", path: "/dashboard/parent/risk-alerts", icon: AlertTriangle },
      { name: "Leave History", path: "/dashboard/parent/leave-records", icon: UserCheck },
      { name: "Fines & Clearance", path: "/dashboard/parent/fines", icon: Receipt },
    ],
  };

  const navItems = menuConfig[role] || [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 glass-card bg-[#0B132B]/95 border-r border-slate-800/80 z-40 transition-transform duration-300 flex flex-col justify-between p-4",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="space-y-1.5 overflow-y-auto pr-1">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            {role.toUpperCase()} PORTAL
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/dashboard/${role}`}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300">Live MongoDB Engine</p>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Real Database Sync</span>
          </div>
        </div>
      </aside>
    </>
  );
};
