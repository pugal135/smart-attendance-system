import React, { useState, useEffect } from "react";
import { parentsAPI, analyticsAPI, finesAPI, clearanceAPI } from "../../api/services";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { FineCard } from "../../components/fines/FineCard";
import { ClearanceBadge } from "../../components/fines/ClearanceBadge";
import {
  Users,
  CalendarCheck2,
  AlertTriangle,
  Receipt,
  TrendingDown,
  Sparkles,
  BookOpen,
  Award,
} from "lucide-react";

export const ParentDashboard = () => {
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState("");
  const [stats, setStats] = useState(null);
  const [fines, setFines] = useState([]);
  const [clearance, setClearance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await parentsAPI.getMyWards();
        setWards(res.data);
        if (res.data.length > 0) setSelectedWardId(res.data[0]._id);
      } catch (e) {
        console.error(e);
      }
    };
    fetchWards();
  }, []);

  useEffect(() => {
    const fetchWardStats = async () => {
      if (!selectedWardId) return;
      setLoading(true);
      try {
        const [sRes, fRes, cRes] = await Promise.all([
          analyticsAPI.getStudentAnalytics(selectedWardId),
          finesAPI.getFines({ student_id: selectedWardId }),
          clearanceAPI.getClearances({ student_id: selectedWardId }),
        ]);
        setStats(sRes.data);
        setFines(fRes.data);
        setClearance(cRes.data[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWardStats();
  }, [selectedWardId]);

  const activeWard = wards.find((w) => w._id === selectedWardId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Parent Watch Portal</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time attendance, academic performance, and risk alerts for your linked ward</p>
        </div>

        {wards.length > 1 && (
          <select
            value={selectedWardId}
            onChange={(e) => setSelectedWardId(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            {wards.map((w) => (
              <option key={w._id} value={w._id}>{w.name} ({w.register_number})</option>
            ))}
          </select>
        )}
      </div>

      {/* Ward Info Capsule */}
      {activeWard && (
        <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-base">
              {activeWard.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{activeWard.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Reg: {activeWard.register_number} • Class: {activeWard.class_name}</p>
            </div>
          </div>
          <Badge variant="info">LINKED WARD</Badge>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={stats?.has_data ? `${stats.overall_percentage}%` : "No Data"}
          subtitle={`${stats?.present_count || 0} of ${stats?.total_classes || 0} classes`}
          icon={CalendarCheck2}
          color={stats?.overall_percentage >= 75 ? "emerald" : stats?.overall_percentage >= 65 ? "amber" : "rose"}
        />
        <StatCard
          title="Academic Risk Level"
          value={stats?.risk_level || "CALCULATING"}
          subtitle={stats?.risk_message || "Awaiting records"}
          icon={AlertTriangle}
          color={stats?.risk_level === "LOW" ? "emerald" : stats?.risk_level === "MEDIUM" ? "amber" : "rose"}
        />
        <StatCard
          title="Penalty Status"
          value={fines.filter((f) => f.status !== "PAID").length}
          subtitle="48-Hour Shortage Dues"
          icon={Receipt}
          color="amber"
        />
        <StatCard
          title="Consecutive Absences"
          value={stats?.consecutive_absences || 0}
          subtitle={stats?.consecutive_absence_alert ? "Critical Alert Dispatched" : "Normal Standing"}
          icon={AlertTriangle}
          color={stats?.consecutive_absence_alert ? "rose" : "emerald"}
        />
      </div>

      {/* Drop Warning Banner */}
      {stats?.is_dropping && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs">
          <TrendingDown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-white">Attendance Drop Notice</h4>
            <p className="mt-0.5">{stats.drop_warning}</p>
          </div>
        </div>
      )}

      {/* Outstanding Penalty Alert Banner with Paytm / UPI QR Quick Action */}
      {fines.filter((f) => f.status !== "PAID").length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">Attendance Shortage Penalty (Below 65%)</h4>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">Action Required</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Ward attendance is <strong className="text-rose-400">{stats?.overall_percentage}%</strong>. Penalty of <strong className="text-white font-mono">₹500.00</strong> due within 48 hours.
              </p>
            </div>
          </div>
          <a
            href="/parent/fines"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Scan QR & Pay (₹500)</span>
          </a>
        </div>
      )}

      {/* Subject Breakdown & Clearance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Ward Subject Attendance</h3>
            <p className="text-xs text-slate-400">Attendance percentages recorded by each course instructor</p>
          </div>

          <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
            {(!stats?.subject_breakdown || stats.subject_breakdown.length === 0) ? (
              <EmptyState
                icon={BookOpen}
                title="No attendance records available"
                description="Attendance records will calculate dynamically as classes take place."
              />
            ) : (
              stats.subject_breakdown.map((sub) => (
                <div key={sub.subject_id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-bold text-white text-xs block">{sub.subject_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sub.subject_code}</span>
                    </div>
                    <Badge variant={sub.risk_level === "LOW" ? "success" : sub.risk_level === "MEDIUM" ? "warning" : "danger"}>
                      {sub.percentage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sub.percentage >= 75 ? "bg-emerald-500" : sub.percentage >= 65 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-3">University Clearance Certificate</h3>
          <ClearanceBadge clearance={clearance} />
        </div>
      </div>
    </div>
  );
};
