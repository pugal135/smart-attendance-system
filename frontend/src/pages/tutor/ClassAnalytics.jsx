import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

export const ClassAnalytics = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Class Risk & Attendance Trends</h2>
        <p className="text-xs text-slate-400 mt-0.5">Faculty section insights and at-risk student monitoring</p>
      </div>

      <div className="p-6 rounded-2xl glass-card border border-slate-800 text-center py-16">
        <Users className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h4 className="text-base font-bold text-white">Select a Class in Mark Attendance</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          Attendance rates, consecutive absences, and slope trends calculate dynamically upon marking class sessions.
        </p>
        <Link
          to="/dashboard/tutor/mark-attendance"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Open Class Roster
        </Link>
      </div>
    </div>
  );
};
