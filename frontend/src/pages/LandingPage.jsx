import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Zap,
  TrendingDown,
  AlertTriangle,
  QrCode,
  Users,
  Award,
  ArrowRight,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#060A17] text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#0B132B]/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
              SMART<span className="text-indigo-400">ATTENDANCE</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">College Risk Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            Access Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section with Graduation Background */}
      <section className="relative pt-24 pb-28 px-6 lg:px-16 overflow-hidden">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 opacity-30"
          style={{ backgroundImage: `url('/assets/graduation_bg.png')` }}
        />
        {/* Gradient Blends into page */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060A17]/80 via-[#060A17]/60 to-[#060A17] z-0" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 to-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Academic Risk Management
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Smart Attendance & <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Student Risk Intelligence
            </span>
          </h2>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Real-time attendance monitoring, intelligent risk prediction, automated parent alerts, and smart academic insights — all in one centralized platform.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2.5 group"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition text-center"
            >
              Explore Features
            </a>
          </div>

          {/* Architecture Pipeline Pill */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300">REAL DATA</span>
            <span>→</span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">MONGODB</span>
            <span>→</span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300">LIVE ROSTER</span>
            <span>→</span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">RISK ENGINE</span>
            <span>→</span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-rose-300">PARENT ALERTS</span>
            <span>→</span>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-purple-300">CLEARANCE</span>
          </div>
        </div>
      </section>

      {/* 4 Connected Roles */}
      <section className="py-16 px-6 lg:px-16 border-y border-slate-800/80 bg-[#0B132B]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-white tracking-tight">Four Integrated Academic Roles</h3>
            <p className="text-xs text-slate-400 mt-2">One single source of truth connecting every stakeholder with secure role-based access control.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { role: "ADMIN", desc: "Complete college control, faculty assignments, risk policies, fine rules, and official clearance certification.", color: "border-rose-500/30 text-rose-400 bg-rose-500/10" },
              { role: "TUTOR / FACULTY", desc: "Auto-loaded rosters, batch marking, live dynamic QR check-ins, leave approvals, and student explanation verification.", color: "border-purple-500/30 text-purple-400 bg-purple-500/10" },
              { role: "STUDENT", desc: "Real-time percentages, recovery simulator, leave applications, 48h fine payment clock, and official clearance pass.", color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10" },
              { role: "PARENT", desc: "Real-time visibility into ward attendance, period status, consecutive absence notices, and fine settlement status.", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
            ].map((item, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase font-mono border ${item.color} mb-3`}>
                    {item.role}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6 lg:px-16 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-3xl font-extrabold text-white tracking-tight">Key Enterprise Modules</h3>
          <p className="text-xs text-slate-400 mt-2">Zero mock data. Everything calculated dynamically on verified records.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Smart Live Roster", icon: Users, text: "Tutors select Class and Subject. Student names load automatically. Batch marking with duplicate submission protection." },
            { title: "Dynamic QR Attendance", icon: QrCode, text: "Temporary expiring QR codes with sub-second live check-in feeds. Validates class enrollment and timestamps." },
            { title: "Drop & Trend Detection", icon: TrendingDown, text: "Sliding-window slope analysis catches attendance decline before it falls below critical university thresholds." },
            { title: "Consecutive Absence Alerts", icon: AlertTriangle, text: "3 consecutive unexcused absences trigger simultaneous automated alerts to Student, Parent, and Tutor." },
            { title: "Recovery Calculator", icon: Zap, text: "Interactive what-if simulator computes the exact number of consecutive classes required to reach target percentages." },
            { title: "2-Day Penalty & Clearance", icon: Award, text: "Automatic fine generation with a strict 48-hour countdown timer, UPI QR checkout, and Admin clearance signoff." },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{f.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B132B] py-8 px-6 lg:px-16 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">Smart Attendance & Student Risk Management System</p>
        <p className="text-[11px] mt-1 font-mono">Tagline: “Track Attendance. Predict Risk. Stay Connected.”</p>
      </footer>
    </div>
  );
};
