import React, { useState, useEffect } from "react";
import { finesAPI, clearanceAPI } from "../../api/services";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Receipt, Award, CheckCircle2, Clock, ShieldCheck, Sparkles } from "lucide-react";

export const FinesClearance = () => {
  const [fines, setFines] = useState([]);
  const [clearances, setClearances] = useState([]);
  const [activeTab, setActiveTab] = useState("fines");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        finesAPI.getFines(),
        clearanceAPI.getClearances(),
      ]);
      setFines(fRes.data);
      setClearances(cRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyClearance = async (clearanceId) => {
    try {
      await clearanceAPI.verifyClearance(clearanceId, {
        status: "CLEARANCE_COMPLETED",
        remarks: "Approved and verified by University Administrator",
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const statusVariants = {
    PENDING: "warning",
    PAYMENT_PROCESSING: "info",
    PAID: "success",
    OVERDUE: "danger",
    CLEARANCE_COMPLETED: "success",
    PENDING_VERIFICATION: "warning",
    CLEARANCE_REQUIRED: "danger",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Fine Ledger & Clearance Endorsement</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage 48-hour penalty lifecycles and verify official academic clearance passes</p>
        </div>

        <div className="flex gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("fines")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "fines" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Fines & Penalties ({fines.length})
          </button>
          <button
            onClick={() => setActiveTab("clearance")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "clearance" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Clearance Passes ({clearances.length})
          </button>
        </div>
      </div>

      {activeTab === "fines" ? (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          {fines.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No fine records available"
              description="Fines are dynamically generated when student attendance drops below configured thresholds."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Student Details</th>
                    <th className="px-5 py-3.5">Shortage Snapshot</th>
                    <th className="px-5 py-3.5">Fine Amount</th>
                    <th className="px-5 py-3.5">Generated Date</th>
                    <th className="px-5 py-3.5">2-Day Due Date</th>
                    <th className="px-5 py-3.5">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fines.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{f.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{f.register_number} ({f.class_name})</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-extrabold text-rose-400">
                        {f.attendance_percentage_snapshot}%
                      </td>
                      <td className="px-5 py-3.5 font-mono font-extrabold text-white text-sm">
                        ₹{f.fine_amount}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400">{f.generated_date}</td>
                      <td className="px-5 py-3.5 font-mono text-amber-400 font-semibold">{f.due_date}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariants[f.status] || "default"}>{f.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          {clearances.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No Clearance Records"
              description="Student clearance records will appear here for verification after penalties are settled."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Student Details</th>
                    <th className="px-5 py-3.5">Class</th>
                    <th className="px-5 py-3.5">Clearance Status</th>
                    <th className="px-5 py-3.5">Verification Remarks</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clearances.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{c.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.register_number}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{c.class_name || "N/A"}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariants[c.status] || "default"}>
                          {c.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 italic">{c.remarks || "No remarks"}</td>
                      <td className="px-5 py-3.5 text-right">
                        {c.status !== "CLEARANCE_COMPLETED" ? (
                          <button
                            onClick={() => handleVerifyClearance(c._id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 ml-auto"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Endorse Clearance
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-mono text-[11px] font-semibold">Endorsed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
