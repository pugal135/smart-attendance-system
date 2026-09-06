import React, { useState, useEffect } from "react";
import { leavesAPI } from "../../api/services";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { UserCheck, CheckCircle2, XCircle } from "lucide-react";

export const LeavesApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const fetchLeaves = async () => {
    try {
      const res = await leavesAPI.getLeaves({
        status_filter: filter === "ALL" ? undefined : filter,
      });
      setLeaves(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const handleReview = async (id, status) => {
    const remarks = prompt(`Enter optional review remarks for ${status.toLowerCase()}:`) || "Reviewed by faculty";
    try {
      await leavesAPI.reviewLeave(id, { status, remarks });
      fetchLeaves();
    } catch (e) {
      console.error(e);
    }
  };

  const statusVariants = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Student Leave Request Queue</h2>
          <p className="text-xs text-slate-400 mt-0.5">Review, approve, or reject student leave requests with automatic attendance update</p>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === st ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {leaves.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Leave Requests Found"
            description="Student leave applications will appear here for faculty review."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Leave Duration</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{l.student_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{l.register_number} ({l.class_name})</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-indigo-300 font-semibold">
                      {l.from_date} <span className="text-slate-500">to</span> {l.to_date}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 italic max-w-sm">{l.reason}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariants[l.status] || "default"}>{l.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {l.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReview(l._id, "APPROVED")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReview(l._id, "REJECTED")}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {l.reviewer_name ? `Reviewed by ${l.reviewer_name}` : "Settled"}
                        </span>
                      )}
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
