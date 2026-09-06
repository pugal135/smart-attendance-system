import React, { useState, useEffect } from "react";
import { analyticsAPI } from "../../api/services";
import { Calculator, Target, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { Badge } from "../common/Badge";

export const AttendanceRecoveryCalculator = ({ studentId, currentPresent = 0, currentTotal = 0 }) => {
  const [targetPct, setTargetPct] = useState(75);
  const [classesToAttend, setClassesToAttend] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await analyticsAPI.calculateRecovery(studentId, targetPct, classesToAttend);
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [studentId, targetPct, classesToAttend]);

  const currentPct = currentTotal > 0 ? ((currentPresent / currentTotal) * 100).toFixed(1) : 0;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Attendance Recovery Simulator</h3>
          <p className="text-xs text-slate-400">Calculate projected attendance and recovery targets dynamically</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Target Attendance Goal</span>
              <span className="text-indigo-400 font-bold">{targetPct}%</span>
            </div>
            <div className="flex gap-2">
              {[75, 80, 85, 90].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTargetPct(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    targetPct === t
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>"What if I attend the next..."</span>
              <span className="text-cyan-400 font-bold">{classesToAttend} classes</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={classesToAttend}
              onChange={(e) => setClassesToAttend(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 Class</span>
              <span>10 Classes</span>
              <span>25 Classes</span>
            </div>
          </div>
        </div>

        {/* Dynamic Simulation Result Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Current Standing</span>
              <Badge variant={currentPct >= targetPct ? "success" : "warning"}>{currentPct}%</Badge>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Projected Attendance</span>
              <span className="text-xl font-extrabold text-cyan-400 font-mono">
                {result?.projected_percentage || currentPct}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
              <span>{result?.message || "Computing recovery plan..."}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            * Exact formula based on verified MongoDB records: ((Present + K) / (Total + K)) * 100
          </div>
        </div>
      </div>
    </div>
  );
};
