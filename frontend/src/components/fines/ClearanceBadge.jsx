import React from "react";
import { Award } from "lucide-react";
import { Badge } from "../common/Badge";

export const ClearanceBadge = ({ clearance }) => {
  if (!clearance) {
    return (
      <div className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">University Academic Clearance</h4>
            <p className="text-xs text-slate-400">Official Clearance Pass Status</p>
          </div>
        </div>
        <Badge variant="success">IN GOOD STANDING</Badge>
      </div>
    );
  }

  const isCompleted = clearance.status === "CLEARANCE_COMPLETED";
  const isPending = clearance.status === "PENDING_VERIFICATION";

  return (
    <div className={`p-5 rounded-2xl glass-card border ${isCompleted ? "border-emerald-500/40 glow-emerald" : "border-slate-800"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${isCompleted ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : isPending ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-rose-500/20 text-rose-400 border-rose-500/40"}`}>
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Official University Clearance</h4>
            <p className="text-xs text-slate-400 font-mono">Student: {clearance.student_name} ({clearance.register_number})</p>
          </div>
        </div>
        <Badge variant={isCompleted ? "success" : isPending ? "warning" : "danger"}>
          {clearance.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Remarks: <strong className="text-slate-200">{clearance.remarks || "Standard academic clearance"}</strong></span>
        {clearance.verified_by && (
          <span className="font-mono text-[11px] text-indigo-400">Verified by: {clearance.verified_by}</span>
        )}
      </div>
    </div>
  );
};
