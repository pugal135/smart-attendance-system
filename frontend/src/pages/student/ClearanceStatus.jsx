import React, { useState, useEffect } from "react";
import { clearanceAPI } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { ClearanceBadge } from "../../components/fines/ClearanceBadge";

export const ClearanceStatus = () => {
  const { user } = useAuth();
  const studentId = user?.linked_entity_id || user?.profile?._id;
  const [clearance, setClearance] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    clearanceAPI.getClearances({ student_id: studentId }).then((res) => {
      setClearance(res.data[0] || null);
    }).catch(console.error);
  }, [studentId]);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">University Examination Clearance Pass</h2>
        <p className="text-xs text-slate-400 mt-0.5">Official examination hall and semester endorsement credential</p>
      </div>

      <ClearanceBadge clearance={clearance} />
    </div>
  );
};
