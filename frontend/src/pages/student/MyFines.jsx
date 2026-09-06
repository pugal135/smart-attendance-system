import React, { useState, useEffect } from "react";
import { finesAPI } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { FineCard } from "../../components/fines/FineCard";
import { PaymentModal } from "../../components/fines/PaymentModal";
import { EmptyState } from "../../components/common/EmptyState";
import { Receipt, ShieldCheck } from "lucide-react";

export const MyFines = () => {
  const { user } = useAuth();
  const studentId = user?.linked_entity_id || user?.profile?._id;
  const [fines, setFines] = useState([]);
  const [selectedFine, setSelectedFine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFines = async () => {
    if (!studentId) return;
    try {
      const res = await finesAPI.getFines({ student_id: studentId });
      setFines(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [studentId]);

  const handlePay = (fine) => {
    setSelectedFine(fine);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Attendance Penalties & 48-Hour Dues</h2>
        <p className="text-xs text-slate-400 mt-0.5">Settle attendance shortage fines via university approved UPI QR and gateway channels</p>
      </div>

      {fines.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 border border-slate-800 text-center py-16">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">Zero Outstanding Fines</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Your attendance meets all university criteria. No penalties are pending.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fines.map((f) => (
            <FineCard key={f._id} fine={f} onPay={handlePay} />
          ))}
        </div>
      )}

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fine={selectedFine}
        onSuccess={fetchFines}
      />
    </div>
  );
};
