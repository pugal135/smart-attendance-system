import React, { useState, useEffect } from "react";
import { leavesAPI } from "../../api/services";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { UserCheck } from "lucide-react";

export const ChildLeaveRecords = () => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    leavesAPI.getLeaves().then((res) => setLeaves(res.data)).catch(console.error);
  }, []);

  const statusVariants = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Ward Leave Request Records</h2>
        <p className="text-xs text-slate-400 mt-0.5">History of leave applications submitted by your ward and faculty decisions</p>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {leaves.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Leave Records"
            description="Leave applications submitted by your child will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Decision Status</th>
                  <th className="px-5 py-3.5">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5 text-indigo-300 font-semibold">{l.from_date} to {l.to_date}</td>
                    <td className="px-5 py-3.5 font-sans text-slate-200">{l.reason}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariants[l.status] || "default"}>{l.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-400 italic">{l.review_remarks || "Awaiting decision"}</td>
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
