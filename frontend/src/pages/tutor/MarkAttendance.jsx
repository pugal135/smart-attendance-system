import React, { useState, useEffect } from "react";
import { academicsAPI, attendanceAPI } from "../../api/services";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { CalendarCheck2, Users, Save, CheckCircle2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

export const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const initData = async () => {
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
    initData();
  }, []);

  const classSubjects = subjects.filter((s) => s.class_id === selectedClass);

  useEffect(() => {
    if (classSubjects.length > 0) {
      setSelectedSubject(classSubjects[0]._id);
    } else {
      setSelectedSubject("");
    }
  }, [selectedClass, subjects]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedClass) return;
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");
      try {
        const res = await academicsAPI.getClassStudents(selectedClass);
        setStudents(res.data);

        const initialMap = {};
        res.data.forEach((st) => {
          initialMap[st._id] = "PRESENT";
        });
        setAttendanceMap(initialMap);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [selectedClass]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || students.length === 0) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const entries = students.map((st) => ({
      student_id: st._id,
      status: attendanceMap[st._id] || "PRESENT",
    }));

    try {
      const res = await attendanceAPI.submitBatch({
        class_id: selectedClass,
        subject_id: selectedSubject,
        date: selectedDate,
        period: Number(selectedPeriod),
        entries,
      });
      setSuccessMsg(res.data.message || "Attendance saved successfully.");
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to submit attendance. Duplicate check failed.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === "PRESENT" || s === "LATE").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "ABSENT").length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === "LATE").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Mark Classroom Attendance</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Select class session. Student names load automatically from the database.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Class Cohort</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Course Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {classSubjects.length === 0 ? (
                <option value="">No subjects found for class</option>
              ) : (
                classSubjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Period Hour</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                <option key={p} value={p}>Period {p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Roster: <strong className="text-white">{students.length} Students</strong></span>
            <span className="text-emerald-400">Present: <strong>{presentCount}</strong></span>
            <span className="text-rose-400">Absent: <strong>{absentCount}</strong></span>
            <span className="text-amber-400">Late: <strong>{lateCount}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll("PRESENT")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-400 transition"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll("ABSENT")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-rose-400 transition"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          {students.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students found in this class"
              description="Enroll students into this class in the Admin directory to load the automated roster."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Student Name</th>
                    <th className="px-5 py-3.5">Register No</th>
                    <th className="px-5 py-3.5 text-center">Status Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((st, index) => {
                    const currentStatus = attendanceMap[st._id] || "PRESENT";
                    return (
                      <tr key={st._id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-3.5 font-mono text-slate-500 text-xs">{index + 1}</td>
                        <td className="px-5 py-3.5 font-bold text-white text-sm">{st.name}</td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-indigo-400">{st.register_number}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(st._id, "PRESENT")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                currentStatus === "PRESENT"
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(st._id, "LATE")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                currentStatus === "LATE"
                                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(st._id, "ABSENT")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                currentStatus === "ABSENT"
                                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving to Database..." : `Submit Attendance (${selectedDate}, Period ${selectedPeriod})`}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
