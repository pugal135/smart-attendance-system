import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { analyticsAPI, finesAPI, clearanceAPI, leavesAPI } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { FineCard } from "../../components/fines/FineCard";
import { PaymentModal } from "../../components/fines/PaymentModal";
import { ClearanceBadge } from "../../components/fines/ClearanceBadge";
import { AttendanceRecoveryCalculator } from "../../components/calculator/AttendanceRecoveryCalculator";
import { EmptyState } from "../../components/common/EmptyState";
import {
  CalendarCheck2,
  TrendingDown,
  AlertTriangle,
  QrCode,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const studentId = user?.linked_entity_id || user?.profile?._id;

  const [stats, setStats] = useState(null);
  const [fines, setFines] = useState([]);
  const [clearance, setClearance] = useState(null);
  const [academicPrediction, setAcademicPrediction] = useState(null);
  const [selectedFineForPay, setSelectedFineForPay] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const [sRes, fRes, cRes, pRes] = await Promise.all([
        analyticsAPI.getStudentAnalytics(studentId),
        finesAPI.getFines({ student_id: studentId }),
        clearanceAPI.getClearances({ student_id: studentId }),
        analyticsAPI.getAcademicPrediction(studentId),
      ]);
      setStats(sRes.data);
      setFines(fRes.data);
      setClearance(cRes.data[0] || null);
      setAcademicPrediction(pRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const handleOpenPay = (fine) => {
    setSelectedFineForPay(fine);
    setIsPayModalOpen(true);
  };

  const riskBadgeVariants = {
    LOW: "success",
    MEDIUM: "warning",
    HIGH: "danger",
    NO_DATA: "default",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Student Academic Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time attendance metrics, risk predictions, and penalty countdowns</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/student/qr-scanner"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" /> Scan Class QR
          </Link>
          <Link
            to="/dashboard/student/apply-leave"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition"
          >
            Apply Leave
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={stats?.has_data ? `${stats.overall_percentage}%` : "No Data"}
          subtitle={`${stats?.present_count || 0} of ${stats?.total_classes || 0} classes attended`}
          icon={CalendarCheck2}
          color={stats?.overall_percentage >= 75 ? "emerald" : stats?.overall_percentage >= 65 ? "amber" : "rose"}
        />
        <StatCard
          title="Standing Risk Level"
          value={stats?.risk_level || "CALCULATING"}
          subtitle={stats?.risk_message || "Awaiting attendance"}
          icon={AlertTriangle}
          color={stats?.risk_level === "LOW" ? "emerald" : stats?.risk_level === "MEDIUM" ? "amber" : "rose"}
        />
        <StatCard
          title="Pending Dues"
          value={fines.filter((f) => f.status !== "PAID").length}
          subtitle="48-Hour Deadline Rules"
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Mark Range (AI/ML)"
          value={academicPrediction?.has_data ? academicPrediction.predicted_range : "Needs Marks"}
          subtitle={academicPrediction?.has_data ? academicPrediction.predicted_grade : "Insufficient Evaluation Data"}
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Early Warning Banners */}
      {stats?.is_dropping && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs animate-pulse-subtle">
          <TrendingDown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-white">Attendance Decline Detected</h4>
            <p className="mt-0.5">{stats.drop_warning}</p>
          </div>
        </div>
      )}

      {stats?.consecutive_absence_alert && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-white">Consecutive Absence Notice</h4>
            <p className="mt-0.5">
              You have been marked absent for {stats.consecutive_absences} consecutive classes. Automated notifications have been dispatched to your parent and tutor.
            </p>
          </div>
        </div>
      )}

      {/* Subject Breakdown & Recovery Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Cards */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Subject Attendance Roster</h3>
                <p className="text-xs text-slate-400">Live percentage calculation per curriculum course</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
              {(!stats?.subject_breakdown || stats.subject_breakdown.length === 0) ? (
                <EmptyState
                  icon={BookOpen}
                  title="No attendance records available"
                  description="Subject percentages calculate dynamically after class attendance is marked by faculty."
                />
              ) : (
                stats.subject_breakdown.map((sub) => (
                  <div key={sub.subject_id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="font-bold text-white text-xs block">{sub.subject_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sub.subject_code}</span>
                      </div>
                      <Badge variant={sub.risk_level === "LOW" ? "success" : sub.risk_level === "MEDIUM" ? "warning" : "danger"}>
                        {sub.percentage}% ({sub.risk_level})
                      </Badge>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.percentage >= 75 ? "bg-emerald-500" : sub.percentage >= 65 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            * 75% minimum attendance required for university examination eligibility.
          </div>
        </div>

        {/* Recovery Simulator */}
        <AttendanceRecoveryCalculator
          studentId={studentId}
          currentPresent={stats?.present_count || 0}
          currentTotal={stats?.total_classes || 0}
        />
      </div>

      {/* Active Fines & Clearance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Attendance Shortage Penalties</h3>
          {fines.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center py-10">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Outstanding Fines</h4>
              <p className="text-xs text-slate-400 mt-0.5">Your attendance satisfies university compliance rules.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fines.map((fine) => (
                <FineCard key={fine._id} fine={fine} onPay={handleOpenPay} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-3">Official University Clearance Pass</h3>
          <ClearanceBadge clearance={clearance} />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        fine={selectedFineForPay}
        onSuccess={fetchStudentData}
      />
    </div>
  );
};
