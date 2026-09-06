import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { analyticsAPI, adminAPI, finesAPI } from "../../api/services";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  AlertTriangle,
  Receipt,
  UserCheck,
  Plus,
  ArrowRight,
  TrendingDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const [sumRes, actRes] = await Promise.all([
        analyticsAPI.getAdminSummary(),
        adminAPI.getRecentActivities(),
      ]);
      setSummary(sumRes.data);
      setActivities(actRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleEvaluateFines = async () => {
    setEvaluating(true);
    try {
      await finesAPI.evaluateAll();
      await fetchSummary();
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const chartData = summary?.risk_distribution || [];
  const hasRiskData = chartData.some((d) => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">University Command Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time attendance metrics, risk predictions, and penalty ledger</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSummary}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleEvaluateFines}
            disabled={evaluating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {evaluating ? "Evaluating..." : "Run Risk & Fine Check"}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={summary?.total_students || 0}
          subtitle="Enrolled Active Students"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Faculty Members"
          value={summary?.total_tutors || 0}
          subtitle="Teaching Tutors"
          icon={GraduationCap}
          color="purple"
        />
        <StatCard
          title="High Risk Students"
          value={summary?.high_risk_count || 0}
          subtitle="Attendance < 65%"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Pending Fines"
          value={summary?.pending_fines_count || 0}
          subtitle={`₹${summary?.total_fines_amount || 0} total dues`}
          icon={Receipt}
          color="amber"
        />
      </div>

      {/* Quick Action Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          to="/dashboard/admin/students"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold text-slate-200 transition"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" /> Add Student
        </Link>
        <Link
          to="/dashboard/admin/tutors"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-xs font-semibold text-slate-200 transition"
        >
          <Plus className="w-3.5 h-3.5 text-purple-400" /> Add Tutor
        </Link>
        <Link
          to="/dashboard/admin/classes-subjects"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 transition"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" /> Manage Curriculum
        </Link>
        <Link
          to="/dashboard/admin/fines-clearance"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 transition"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Verify Clearance
        </Link>
      </div>

      {/* Analytics Row: Risk Distribution Chart & Low Attendance Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Risk Distribution Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Risk Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Calculated dynamically from MongoDB</p>
          </div>

          <div className="h-64 my-4 flex items-center justify-center">
            {!hasRiskData ? (
              <EmptyState
                icon={AlertTriangle}
                title="Insufficient Data"
                description="Attendance records will populate the real risk distribution."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0B132B", borderColor: "#1C2541", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-mono text-center">
            Thresholds: Low (&gt;=75%) | Med (65-74%) | High (&lt;65%)
          </div>
        </div>

        {/* Low Attendance & High Risk Register */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Critical Risk & Shortage Students</h3>
              <p className="text-xs text-slate-400">Students flagged below required thresholds</p>
            </div>
            <Link to="/dashboard/admin/risk-monitor" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="my-3 overflow-x-auto">
            {(!summary?.low_attendance_students || summary.low_attendance_students.length === 0) ? (
              <EmptyState
                title="No Students at Risk"
                description="All enrolled students currently satisfy attendance thresholds or data has not been recorded."
              />
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <th className="pb-2">Student Name</th>
                    <th className="pb-2">Register No</th>
                    <th className="pb-2">Class</th>
                    <th className="pb-2">Attendance %</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {summary.low_attendance_students.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 font-semibold text-white">{st.name}</td>
                      <td className="py-2.5 font-mono text-slate-400">{st.register_number}</td>
                      <td className="py-2.5 text-slate-300">{st.class_name || "N/A"}</td>
                      <td className="py-2.5 font-mono font-extrabold text-rose-400">{st.percentage}%</td>
                      <td className="py-2.5">
                        <Badge variant={st.risk_level === "HIGH" ? "danger" : "warning"}>
                          {st.risk_level} RISK
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pt-2 text-[11px] text-slate-500">
            * Automatically triggers parent alerts and fine generation according to college policy rules.
          </div>
        </div>
      </div>

      {/* Recent Audit Activities */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">System Audit Trail</h3>
            <p className="text-xs text-slate-400">Timestamped record of attendance entries, overrides, and fine updates</p>
          </div>
          <Link to="/dashboard/admin/audit" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            View Full Trail <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-3 space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-800/60">
          {activities.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No audit trail records yet.</p>
          ) : (
            activities.map((a, i) => (
              <div key={i} className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="info">{a.action_type}</Badge>
                  <span className="text-white font-medium">{a.actor_name}</span>
                  <span className="text-slate-400">({a.details || a.entity_name})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
