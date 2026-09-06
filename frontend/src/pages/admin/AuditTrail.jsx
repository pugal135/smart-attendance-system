import React, { useState, useEffect } from "react";
import { auditAPI } from "../../api/services";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { History, Shield, RefreshCw } from "lucide-react";

export const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditAPI.getLogs();
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">University Audit Trail</h2>
          <p className="text-xs text-slate-400 mt-0.5">Immutable record of attendance entries, overrides, fine payments, and rule updates</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No audit entries recorded yet"
            description="All sensitive actions (overrides, fine modifications, settings changes) are automatically logged."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Action Type</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-white">{log.actor_name}</span>
                      <span className="text-[10px] text-slate-500 block uppercase">({log.actor_role})</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="info">{log.action_type}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-indigo-300 font-semibold">{log.entity_name}</td>
                    <td className="px-5 py-3.5 text-slate-300 font-sans text-xs max-w-md">
                      {log.details || "Action executed"}
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
