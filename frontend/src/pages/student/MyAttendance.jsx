import React, { useState, useEffect } from "react";
import { attendanceAPI, academicsAPI } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { CalendarCheck2, Search, Filter } from "lucide-react";

export const MyAttendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const [rRes, sRes] = await Promise.all([
          attendanceAPI.getRecords({ subject_id: selectedSubject || undefined }),
          academicsAPI.getSubjects(),
        ]);
        setRecords(rRes.data);
        setSubjects(sRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedSubject]);

  const statusVariants = {
    PRESENT: "success",
    LATE: "warning",
    ABSENT: "danger",
    UNINFORMED_ABSENCE: "danger",
    APPROVED_LEAVE: "purple",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Attendance Log History</h2>
          <p className="text-xs text-slate-400 mt-0.5">Chronological record of every marked class period and session</p>
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
          ))}
        </select>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No attendance records available"
            description="Attendance entries will appear here once marked by your class faculty."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Session Date</th>
                  <th className="px-5 py-3.5">Period</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Faculty / Tutor</th>
                  <th className="px-5 py-3.5">Mode</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5 text-white font-semibold">{r.date}</td>
                    <td className="px-5 py-3.5 text-indigo-400 font-bold">P{r.period}</td>
                    <td className="px-5 py-3.5 font-sans text-slate-200 font-medium">{r.subject_name}</td>
                    <td className="px-5 py-3.5 font-sans text-slate-400">{r.tutor_name || "Faculty"}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-[10px] uppercase">{r.entry_mode || "MANUAL"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge variant={statusVariants[r.status] || "default"}>
                        {r.status.replace("_", " ")}
                      </Badge>
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
