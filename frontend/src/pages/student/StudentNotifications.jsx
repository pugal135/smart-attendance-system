import React from "react";
import { useNotifications } from "../../context/NotificationContext";
import { Badge } from "../../components/common/Badge";
import { BellRing, CheckCircle2 } from "lucide-react";

export const StudentNotifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Academic Alerts & Notices</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time attendance warnings, penalty reminders, and leave updates</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-10 glass-card rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            No notification records at this time.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={`p-4 rounded-2xl glass-card border transition cursor-pointer flex items-start gap-4 ${
                n.read ? "border-slate-800/80 opacity-70" : "border-indigo-500/40 bg-indigo-500/5"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{n.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                {n.meta_data?.upi_intent && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">GPay Scanner Ready</span>
                      <span className="text-[11px] text-slate-400">Penalty Amount: <strong className="text-white font-mono">₹{n.meta_data.amount || 500}</strong></span>
                    </div>
                    <a
                      href="/student/fines"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                    >
                      Scan & Settle Fine
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
