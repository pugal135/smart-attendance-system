import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { academicsAPI, leavesAPI } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { CalendarCheck2, QrCode, UserCheck, BookOpen, Layers, ArrowRight, CheckCircle2 } from "lucide-react";

export const TutorDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const [cRes, sRes, lRes] = await Promise.all([
          academicsAPI.getClasses(),
          academicsAPI.getSubjects(undefined, user?.linked_entity_id),
          leavesAPI.getLeaves({ status_filter: "PENDING" }),
        ]);
        setClasses(cRes.data);
        setSubjects(sRes.data);
        setLeaves(lRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTutorData();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Faculty Workstation</h2>
          <p className="text-xs text-slate-400 mt-0.5">Welcome back, {user?.name}. Manage class sessions and student attendance.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/tutor/mark-attendance"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <CalendarCheck2 className="w-4 h-4" /> Mark Live Attendance
          </Link>
          <Link
            to="/dashboard/tutor/qr-attendance"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" /> Launch QR Session
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Classes"
          value={classes.length}
          subtitle="Available Cohorts"
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Course Subjects"
          value={subjects.length}
          subtitle="Teaching Subjects"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Pending Leave Requests"
          value={leaves.length}
          subtitle="Awaiting Faculty Decision"
          icon={UserCheck}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">My Assigned Teaching Load</h3>
            <Link to="/dashboard/tutor/mark-attendance" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              Mark Session <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {subjects.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No subjects assigned yet"
                description="Your academic subjects will appear here once allocated by the Administrator."
              />
            ) : (
              subjects.map((s) => (
                <div key={s._id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{s.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{s.code} * {s.class_name}</p>
                  </div>
                  <Badge variant="purple">{s.credits} Credits</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Pending Leave Requests</h3>
            <Link to="/dashboard/tutor/leaves" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {leaves.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/60" />
                <span>No pending student leave requests.</span>
              </div>
            ) : (
              leaves.map((l) => (
                <div key={l._id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{l.student_name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{l.from_date} to {l.to_date}</p>
                  </div>
                  <Badge variant="warning">PENDING</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
