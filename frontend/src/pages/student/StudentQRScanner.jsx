import React, { useState } from "react";
import { QRScannerModal } from "../../components/qr/QRScannerModal";
import { QrCode, Sparkles, CheckCircle2 } from "lucide-react";

export const StudentQRScanner = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto py-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
        <QrCode className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-extrabold text-white tracking-tight">Live Class QR Check-In</h2>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">
        Scan the QR code displayed on the classroom projection screen or enter the 12-digit session code to mark your attendance.
      </p>

      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2 mx-auto"
      >
        <QrCode className="w-4 h-4" /> Open Check-in Modal
      </button>

      <QRScannerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};
