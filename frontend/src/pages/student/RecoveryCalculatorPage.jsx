import React, { useState, useEffect } from "react";
import { analyticsAPI } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { AttendanceRecoveryCalculator } from "../../components/calculator/AttendanceRecoveryCalculator";

export const RecoveryCalculatorPage = () => {
  const { user } = useAuth();
  const studentId = user?.linked_entity_id || user?.profile?._id;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    analyticsAPI.getStudentAnalytics(studentId).then((res) => setStats(res.data)).catch(console.error);
  }, [studentId]);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Attendance Recovery & Simulation</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulate target attendance percentages and calculate exact future class attendance requirements
        </p>
      </div>

      <AttendanceRecoveryCalculator
        studentId={studentId}
        currentPresent={stats?.present_count || 0}
        currentTotal={stats?.total_classes || 0}
      />
    </div>
  );
};
