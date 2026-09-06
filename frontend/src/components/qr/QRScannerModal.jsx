import React, { useState } from "react";
import { qrAPI } from "../../api/services";
import { Modal } from "../common/Modal";
import { QrCode, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

export const QRScannerModal = ({ isOpen, onClose, onSuccess }) => {
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!sessionToken.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await qrAPI.scanQR({ session_token: sessionToken.trim() });
      setResult(res.data);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to verify QR code. Please check session validity.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSessionToken("");
    setResult(null);
    setError("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Class Attendance QR Check-in" maxWidth="max-w-md">
      {result ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Attendance Verified!</h4>
            <p className="text-xs text-slate-400 mt-1">{result.message}</p>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300">
              Enter the 12-digit Class Session Code displayed on the classroom screen.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Session Token / Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. QR_7A8B9C0D1E2F"
                value={sessionToken}
                onChange={(e) => setSessionToken(e.target.value.toUpperCase())}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !sessionToken.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              {loading ? "Verifying..." : "Confirm Attendance"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
