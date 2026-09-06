import React, { useState, useEffect } from "react";
import { academicsAPI, qrAPI } from "../../api/services";
import { QRGeneratorModal } from "../../components/qr/QRGeneratorModal";
import { QrCode, Sparkles } from "lucide-react";

export const QRAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [durationSec, setDurationSec] = useState(180);

  const [activeSession, setActiveSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          academicsAPI.getClasses(),
          academicsAPI.getSubjects(),
        ]);
        setClasses(cRes.data);
        setSubjects(sRes.data);
        if (cRes.data.length > 0) setSelectedClass(cRes.data[0]._id);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const classSubjects = subjects.filter((s) => s.class_id === selectedClass);
  useEffect(() => {
    if (classSubjects.length > 0) setSelectedSubject(classSubjects[0]._id);
    else setSelectedSubject("");
  }, [selectedClass, subjects]);

  const handleLaunchQR = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) return;

    setLoading(true);
    try {
      const res = await qrAPI.createSession({
        class_id: selectedClass,
        subject_id: selectedSubject,
        period: Number(selectedPeriod),
        duration_seconds: Number(durationSec),
      });
      setActiveSession(res.data);
      setIsModalOpen(true);
    } catch (e) {
      alert("Failed to launch QR session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Dynamic QR Attendance Generator</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Launch a time-limited QR session with sub-second real-time check-in stream
        </p>
      </div>

      <form onSubmit={handleLaunchQR} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Class Cohort</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {classSubjects.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Period Hour</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => <option key={p} value={p}>Period {p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">QR Expiration Duration</label>
            <select
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            >
              <option value={60}>1 Minute (Fast Check-in)</option>
              <option value={180}>3 Minutes (Standard)</option>
              <option value={300}>5 Minutes (Extended)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading || !selectedSubject}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            {loading ? "Generating..." : "Launch QR Attendance Screen"}
          </button>
        </div>
      </form>

      <QRGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessionData={activeSession}
      />
    </div>
  );
};
