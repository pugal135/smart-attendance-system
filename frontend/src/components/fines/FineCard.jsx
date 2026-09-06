import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, CheckCircle, CreditCard, ShieldAlert } from "lucide-react";
import { Badge } from "../common/Badge";

export const FineCard = ({ fine, onPay }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!fine?.due_date || fine.status === "PAID") return;

    const updateClock = () => {
      const due = new Date(fine.due_date).getTime();
      const now = new Date().getTime();
      const diff = due - now;

      if (diff <= 0) {
        setTimeLeft("DEADLINE EXPIRED - OVERDUE");
        setIsOverdue(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        setIsOverdue(false);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [fine]);

  const statusVariants = {
    PENDING: isOverdue ? "danger" : "warning",
    PAYMENT_PROCESSING: "info",
    PAID: "success",
    OVERDUE: "danger",
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Attendance Shortage Penalty</h4>
              <p className="text-[11px] text-slate-400 font-mono">Issued: {fine.generated_date}</p>
            </div>
          </div>
          <Badge variant={statusVariants[fine.status] || "default"}>
            {fine.status === "PENDING" && isOverdue ? "OVERDUE" : fine.status}
          </Badge>
        </div>

        <div className="my-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Recorded Attendance</span>
            <span className="font-extrabold text-rose-400 font-mono">{fine.attendance_percentage_snapshot}%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Penalty Amount</span>
            <span className="font-extrabold text-white text-base font-mono">₹{fine.fine_amount}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-800">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 2-Day Deadline
            </span>
            <span className={`font-mono text-xs font-bold ${isOverdue ? "text-rose-400" : "text-amber-400"}`}>
              {fine.status === "PAID" ? "Settled" : timeLeft}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 italic">{fine.reason}</p>
      </div>

      {fine.status !== "PAID" && onPay && (
        <button
          onClick={() => onPay(fine)}
          className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
        >
          <CreditCard className="w-4 h-4" />
          Pay Fine (₹{fine.fine_amount})
        </button>
      )}

      {fine.status === "PAID" && (
        <div className="mt-4 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-center gap-2 font-semibold">
          <CheckCircle className="w-4 h-4" />
          Paid on {new Date(fine.paid_at || fine.created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
