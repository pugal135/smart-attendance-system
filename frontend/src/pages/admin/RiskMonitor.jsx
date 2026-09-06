import React, { useState, useEffect } from "react";
import { analyticsAPI, studentsAPI, academicsAPI } from "../../api/services";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { AlertTriangle, TrendingDown, Search, ShieldAlert, Sparkles } from "lucide-react";

export const RiskMonitor = () => {
  const [studentsWithStats, setStudentsWithStats] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const [stRes, clRes] = await Promise.all([
        studentsAPI.getStudents({ class_id: classFilter || undefined, search: search || undefined }),
        academicsAPI.getClasses(),
      ]);
      setClasses(clRes.data);

      const statsPromises = stRes.data.map(async (st) => {
        try {
          const sRes = await analyticsAPI.getStudentAnalytics(st._id);
          return { student: st, stats: sRes.data };
        } catch {
          return { student: st, stats: null };
        }
      });

      const results = await Promise.all(statsPromises);
      setStudentsWithStats(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, [classFilter, search]);

  const atRiskStudents = studentsWithStats.filter(
    (item) => item.stats?.risk_level === "HIGH" || item.stats?.risk_level === "MEDIUM" || item.stats?.is_dropping
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">University Academic Risk Monitor</h2>
          <p className="text-xs text-slate-400 mt-0.5">Automated detection of attendance drops, consecutive absences, and threshold violations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or register no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full sm:w-60 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="">All Classes / Cohorts</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Risk Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {atRiskStudents.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Students at Risk Detected"
            description="No active attendance drop alerts or shortage risks found for the selected filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Class</th>
                  <th className="px-5 py-3.5">Attendance %</th>
                  <th className="px-5 py-3.5">Risk Level</th>
                  <th className="px-5 py-3.5">Alert Flags</th>
                  <th className="px-5 py-3.5">Forecast Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {atRiskStudents.map(({ student, stats }) => (
                  <tr key={student._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white text-sm">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.register_number}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 font-medium">{student.class_name}</td>
                    <td className="px-5 py-3.5 font-mono font-extrabold text-base text-rose-400">
                      {stats?.overall_percentage || 0}%
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={stats?.risk_level === "HIGH" ? "danger" : "warning"}>
                        {stats?.risk_level} RISK
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 space-y-1">
                      {stats?.is_dropping && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <TrendingDown className="w-3.5 h-3.5" /> <span>Attendance Drop</span>
                        </div>
                      )}
                      {stats?.consecutive_absence_alert && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> <span>{stats.consecutive_absences} Consecutive Absences</span>
                        </div>
                      )}
                      {!stats?.is_dropping && !stats?.consecutive_absence_alert && (
                        <span className="text-[11px] text-slate-500 font-mono">Shortage below 75%</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-400 max-w-xs leading-relaxed">
                      {stats?.forecast_message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
