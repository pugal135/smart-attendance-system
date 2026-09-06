import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "../components/common/Badge";

export const LoginPage = () => {
  const [role, setRole] = useState("admin");
  const [identifier, setIdentifier] = useState("admin@college.edu");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
    if (newRole === "admin") {
      setIdentifier("admin@college.edu");
      setPassword("admin123");
    } else if (newRole === "tutor") {
      setIdentifier("tutor123@gmail.com");
      setPassword("tutor123");
    } else if (newRole === "student") {
      setIdentifier("student123@gmail.com");
      setPassword("student123");
    } else if (newRole === "parent") {
      setIdentifier("father133@gmail.com");
      setPassword("mother123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(identifier.trim(), password, role);
      navigate(`/dashboard/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please verify your credentials and role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Real Graduation Background Photo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 filter blur-[1px]"
        style={{ backgroundImage: `url('/assets/graduation_bg.png')` }}
      />
      {/* Dark Theme Gradient & Vignette Overlay for High Readability & SaaS Look */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#060A17]/95 via-[#0B132B]/85 to-[#060A17]/90 backdrop-blur-[2px] z-0" />

      <div className="w-full max-w-md glass-card bg-[#0B132B]/90 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Academic Portal Login</h2>
          <p className="text-xs text-slate-400">Smart Attendance & Student Risk Intelligence</p>
        </div>

        {searchParams.get("expired") && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 text-center">
            Your session has expired. Please log in again.
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Select Your Role
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {[
              { id: "admin", label: "Admin" },
              { id: "tutor", label: "Tutor" },
              { id: "student", label: "Student" },
              { id: "parent", label: "Parent" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleRoleChange(tab.id)}
                className={`py-2 rounded-lg text-xs font-bold transition uppercase ${
                  role === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {role === "student" ? "Register No / Email" : role === "tutor" ? "Employee ID / Email" : "Registered Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={role === "student" ? "e.g. 26AIML001 or student123@gmail.com" : "e.g. user@college.edu"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating..." : `Sign In as ${role.toUpperCase()}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Credentials Helper Cards */}
        <div className="pt-2 border-t border-slate-800 text-center space-y-1">
          <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Ready-to-Use Demo Credentials</p>
          <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
            <div><strong className="text-indigo-400">Admin:</strong> admin@college.edu / admin123</div>
            <div><strong className="text-purple-400">Tutor:</strong> tutor123@gmail.com / tutor123</div>
            <div><strong className="text-cyan-400">Student:</strong> student123@gmail.com / student123</div>
            <div><strong className="text-emerald-400">Parent:</strong> father133@gmail.com / mother123</div>
          </div>
        </div>
      </div>
    </div>
  );
};
