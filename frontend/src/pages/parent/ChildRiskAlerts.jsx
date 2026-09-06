import React from "react";
import { AlertTriangle, TrendingDown, BellRing } from "lucide-react";

export const ChildRiskAlerts = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Ward Risk & Attendance Warnings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Automated alert channel for low attendance and unexcused absences</p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center py-12">
        <BellRing className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <h4 className="text-base font-bold text-white">Active Alert Channel Connected</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
          Whenever your ward incurs an unexcused absence, consecutive missed classes, or drops below the 75% threshold, notifications are automatically dispatched here and via email.
        </p>
      </div>
    </div>
  );
};
