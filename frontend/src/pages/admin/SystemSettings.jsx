import React, { useState, useEffect } from "react";
import { settingsAPI } from "../../api/services";
import { Sliders, Save, ShieldCheck, Mail, AlertTriangle } from "lucide-react";

export const SystemSettings = () => {
  const [settings, setSettings] = useState({
    required_attendance_percentage: 75.0,
    low_attendance_threshold: 75.0,
    medium_risk_threshold: 65.0,
    high_risk_threshold: 65.0,
    fine_amount_per_shortage: 500.0,
    fine_due_days: 2,
    consecutive_absence_alert_count: 3,
    email_alerts_enabled: true,
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_password: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.getSettings();
        if (res.data) setSettings(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await settingsAPI.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">System Rules & Thresholds</h2>
        <p className="text-xs text-slate-400 mt-0.5">Configure academic thresholds, risk engines, 2-day penalty terms, and alert dispatchers</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Attendance Thresholds */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" /> Attendance Requirements & Risk Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Required University Attendance (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.required_attendance_percentage}
                onChange={(e) => setSettings({ ...settings, required_attendance_percentage: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Critical High-Risk Shortage Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.high_risk_threshold}
                onChange={(e) => setSettings({ ...settings, high_risk_threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Fine & Penalty Policy */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Fine & Penalty Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Penalty Amount per Shortage Cycle (₹)
              </label>
              <input
                type="number"
                value={settings.fine_amount_per_shortage}
                onChange={(e) => setSettings({ ...settings, fine_amount_per_shortage: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                Strict Due Date Period (Days)
              </label>
              <input
                type="number"
                value={settings.fine_due_days}
                onChange={(e) => setSettings({ ...settings, fine_due_days: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Email & Notification Settings */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Mail className="w-4 h-4 text-cyan-400" /> Automated Email Dispatcher Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">SMTP Host</label>
              <input
                type="text"
                placeholder="smtp.gmail.com"
                value={settings.smtp_host || ""}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">SMTP User / Email</label>
              <input
                type="text"
                placeholder="alerts@college.edu"
                value={settings.smtp_user || ""}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {success && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <ShieldCheck className="w-4 h-4" /> System settings updated successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save System Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};
