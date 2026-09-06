import React, { useState, useEffect } from "react";
import { leavesAPI } from "../../api/services";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { UserCheck, Send, Calendar } from "lucide-react";

export const ApplyLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    from_date: new Date().toISOString().split("T")[0],
    to_date: new Date().toISOString().split("T")[0],
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await leavesAPI.getLeaves();
      setLeaves(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leavesAPI.applyLeave(formData);
      setSuccess(true);
      setFormData({
        from_date: new Date().toISOString().split("T")[0],
        to_date: new Date().toISOString().split("T")[0],
        reason: "",
      });
      fetchLeaves();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Failed to submit leave application");
    } finally {
      setLoading(false);
    }
  };

  const statusVariants = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Apply for Academic Leave</h2>
        <p className="text-xs text-slate-400 mt-0.5">Submit formal leave applications directly to your class tutor</p>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">From Date</label>
            <input
              type="date"
              required
              value={formData.from_date}
              onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">To Date</label>
            <input
              type="date"
              required
              value={formData.to_date}
              onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Reason for Leave</label>
          <textarea
            required
            rows={3}
            placeholder="Provide academic or medical justification..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {success && <span className="text-xs text-emerald-400 font-semibold">Leave application submitted successfully!</span>}
          <button
            type="submit"
            disabled={loading}
            className="ml-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> {loading ? "Submitting..." : "Submit Leave Application"}
          </button>
        </div>
      </form>

      {/* History */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Leave Application History</h3>
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          {leaves.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No Leave History"
              description="Your submitted leave applications will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Reason</th>
                    <th className="px-5 py-3.5">Status</th>
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
                      <td className="px-5 py-3.5 font-sans text-slate-400 italic">{l.review_remarks || "Awaiting review"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
