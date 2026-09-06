import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { paymentsAPI } from "../../api/services";
import { Modal } from "../common/Modal";
import { CreditCard, QrCode, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

export const PaymentModal = ({ isOpen, onClose, fine, onSuccess }) => {
  const [method, setMethod] = useState("UPI_QR");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [txnRef, setTxnRef] = useState("");

  const handleInitiate = async () => {
    if (!fine) return;
    setLoading(true);
    try {
      const res = await paymentsAPI.createOrder({ fine_id: fine._id, payment_method: method });
      setOrder(res.data);
    } catch (e) {
      console.error("Order create error", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && fine) {
      handleInitiate();
    } else {
      setOrder(null);
      setPaid(false);
      setTxnRef("");
    }
  }, [isOpen, fine, method]);

  const handleVerify = async () => {
    if (!fine || !order) return;
    setLoading(true);
    const mockRef = `TXN_UPI_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    try {
      await paymentsAPI.verifyPayment({
        fine_id: fine._id,
        order_id: order.order_id,
        transaction_ref: mockRef,
        payment_method: method,
      });
      setTxnRef(mockRef);
      setPaid(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!fine) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="College Penalty Payment Gateway" maxWidth="max-w-xl">
      {paid ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Payment Confirmed & Verified</h4>
            <p className="text-xs text-slate-400 mt-1">Transaction Ref: <code className="text-emerald-400 font-mono">{txnRef}</code></p>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs space-y-1.5 max-w-sm mx-auto">
            <div className="flex justify-between"><span className="text-slate-400">Student:</span><span className="font-semibold text-white">{fine.student_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Register No:</span><span className="font-mono text-white">{fine.register_number}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Amount Paid:</span><span className="font-mono font-bold text-white">₹{fine.fine_amount}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Clearance:</span><span className="text-amber-400 font-semibold">Submitted for Admin Verification</span></div>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            Close Receipt
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "UPI_QR", name: "UPI QR Code", icon: QrCode },
              { id: "CARD", name: "Debit / Credit Card", icon: CreditCard },
              { id: "NETBANKING", name: "Net Banking", icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMethod(tab.id)}
                  className={`p-3 rounded-xl text-center border text-xs font-semibold transition flex flex-col items-center gap-1.5 ${
                    method === tab.id
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* UPI QR Display */}
          {method === "UPI_QR" && (
            <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-bold">Paytm UPI</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">Google Pay</span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[11px] font-bold">PhonePe</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">BHIM</span>
              </div>

              {/* Exact Paytm/UPI QR Scanner from User */}
              <div className="p-3 bg-white rounded-2xl shadow-2xl max-w-[210px]">
                <img
                  src="/assets/penalty_qr.png"
                  alt="Official Paytm UPI Penalty QR Scanner"
                  className="w-full h-auto rounded-xl object-contain shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">UPI ID:</span>
                  <code className="text-xs text-amber-400 font-mono font-bold select-all">7708881295@ptyes</code>
                </div>
                <p className="text-xs text-slate-200 font-bold">Scan with Paytm, Google Pay, PhonePe or BHIM</p>
                <p className="text-[11px] text-slate-400">Shortage Penalty: <span className="font-mono font-bold text-white">₹{fine.fine_amount}</span> | 48-Hour Due Countdown</p>
              </div>

              <a
                href={`upi://pay?pa=7708881295@ptyes&pn=Smart_College_Academic_Portal&am=${fine.fine_amount}&cu=INR&tn=Attendance_Fine_${fine.register_number}`}
                className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition"
              >
                <span>Tap to Pay via UPI App (₹{fine.fine_amount})</span>
              </a>
            </div>
          )}

          {/* Card Mock Tab */}
          {method === "CARD" && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-mono mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="4123 5678 9012 3456"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                  defaultValue="4123 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-mono mb-1">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                    defaultValue="12/28"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase font-mono mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                    defaultValue="123"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Netbanking Tab */}
          {method === "NETBANKING" && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="block text-[11px] text-slate-400 uppercase font-mono mb-1">Select Bank</label>
              <select className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm">
                <option>State Bank of India (SBI)</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Punjab National Bank</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              {loading ? "Processing..." : `Confirm Payment of ₹${fine.fine_amount}`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
