import React, { useState, useEffect } from "react";
import { finesAPI, clearanceAPI } from "../../api/services";
import { FineCard } from "../../components/fines/FineCard";
import { ClearanceBadge } from "../../components/fines/ClearanceBadge";
import { PaymentModal } from "../../components/fines/PaymentModal";
import { ShieldCheck } from "lucide-react";

export const ChildFinesClearance = () => {
  const [fines, setFines] = useState([]);
  const [clearance, setClearance] = useState(null);
  const [selectedFine, setSelectedFine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = () => {
    finesAPI.getFines().then((res) => setFines(res.data)).catch(console.error);
    clearanceAPI.getClearances().then((res) => setClearance(res.data[0] || null)).catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = (fine) => {
    setSelectedFine(fine);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Ward Penalties & Clearance Status</h2>
        <p className="text-xs text-slate-400 mt-0.5">Track attendance fine countdowns, settle via GPay / UPI QR, and view university clearance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Attendance Shortage Fines</h3>
          {fines.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center py-10">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Fines Issued</h4>
              <p className="text-xs text-slate-400 mt-0.5">Ward is in compliance with university attendance rules.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fines.map((fine) => (
                <FineCard key={fine._id} fine={fine} onPay={handlePay} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-3">University Clearance Certificate</h3>
          <ClearanceBadge clearance={clearance} />
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fine={selectedFine}
        onSuccess={fetchData}
      />
    </div>
  );
};
