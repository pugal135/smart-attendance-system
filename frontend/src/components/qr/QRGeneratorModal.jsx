import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { qrAPI } from "../../api/services";
import { Modal } from "../common/Modal";
import { Badge } from "../common/Badge";
import { Users, Clock, CheckCircle } from "lucide-react";

export const QRGeneratorModal = ({ isOpen, onClose, sessionData }) => {
  const [liveData, setLiveData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (!isOpen || !sessionData?.session_id) return;

    const poll = async () => {
      try {
        const res = await qrAPI.getLiveFeed(sessionData.session_id);
        setLiveData(res.data);
        setTimeLeft(res.data.time_left_seconds);
      } catch (err) {
        console.error("Live feed poll error", err);
      }
    };

    poll();
    const timer = setInterval(poll, 2500);
    return () => clearInterval(timer);
  }, [isOpen, sessionData]);

  if (!sessionData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Dynamic Attendance QR Session" maxWidth="max-w-2xl">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* QR Display */}
        <div className="flex flex-col items-center p-6 rounded-2xl bg-white text-slate-900 shadow-2xl">
          <QRCodeSVG
            value={sessionData.session_token || "DEMO"}
            size={200}
            level="H"
            includeMargin={true}
          />
          <div className="mt-3 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block">Session Token</span>
            <code className="text-sm font-extrabold tracking-wider bg-slate-100 px-2.5 py-1 rounded-md text-indigo-700 block mt-0.5">
              {sessionData.session_token}
            </code>
          </div>
        </div>

        {/* Live Metrics & Student Feed */}
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Time Remaining</span>
              </div>
              <p className="text-xl font-extrabold text-white mt-1 font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Check-ins</span>
              </div>
              <p className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
                {liveData?.scanned_count || 0}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Live Scanned Roster</span>
              {liveData?.is_active ? (
                <Badge variant="success">Active Session</Badge>
              ) : (
                <Badge variant="danger">Expired</Badge>
              )}
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-800/40">
              {(!liveData?.scanned_students || liveData.scanned_students.length === 0) ? (
                <p className="text-xs text-slate-500 py-4 text-center">Waiting for students to scan QR code...</p>
              ) : (
                liveData.scanned_students.map((st, i) => (
                  <div key={i} className="pt-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium text-white">{st.student_name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({st.register_number})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(st.scanned_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic text-center">
            Students can scan the code using the Student Mobile Portal or enter the 12-digit session token directly.
          </p>
        </div>
      </div>
    </Modal>
  );
};
