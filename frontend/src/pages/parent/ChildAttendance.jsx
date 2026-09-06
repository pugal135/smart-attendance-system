import React, { useState, useEffect } from "react";
import { parentsAPI, attendanceAPI } from "../../api/services";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { CalendarCheck2 } from "lucide-react";

export const ChildAttendance = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    attendanceAPI.getRecords().then((res) => setRecords(res.data)).catch(console.error);
  }, []);

  const statusVariants = {
    PRESENT: "success",
    LATE: "warning",
    ABSENT: "danger",
    UNINFORMED_ABSENCE: "danger",
    APPROVED_LEAVE: "purple",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Ward Classroom Attendance Log</h2>
        <p className="text-xs text-slate-400 mt-0.5">Verified session-by-session records from the college database</p>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No Attendance Records"
            description="Attendance logs marked by faculty will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Period</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Faculty</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5 text-white font-semibold">{r.date}</td>
                    <td className="px-5 py-3.5 text-indigo-400 font-bold">P{r.period}</td>
                    <td className="px-5 py-3.5 font-sans text-slate-200">{r.subject_name}</td>
                    <td className="px-5 py-3.5 font-sans text-slate-400">{r.tutor_name || "Faculty"}</td>
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
