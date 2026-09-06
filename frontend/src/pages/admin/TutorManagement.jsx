import React, { useState, useEffect } from "react";
import { tutorsAPI, academicsAPI } from "../../api/services";
import { Modal } from "../../components/common/Modal";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Plus, GraduationCap, Mail, Phone, BookOpen, UserPlus, CheckCircle2 } from "lucide-react";

export const TutorManagement = () => {
  const [tutors, setTutors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    employee_id: "",
    email: "",
    password: "",
    phone: "",
    department_id: "",
    designation: "Assistant Professor",
    qualification: "M.Tech / Ph.D",
  });

  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);

  const fetchData = async () => {
    try {
      const [tRes, dRes, cRes, sRes] = await Promise.all([
        tutorsAPI.getTutors(),
        academicsAPI.getDepartments(),
        academicsAPI.getClasses(),
        academicsAPI.getSubjects(),
      ]);
      setTutors(tRes.data);
      setDepartments(dRes.data);
      setClasses(cRes.data);
      setSubjects(sRes.data);
      if (dRes.data.length > 0 && !formData.department_id) {
        setFormData((prev) => ({ ...prev, department_id: dRes.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tutorsAPI.createTutor(formData);
      setIsModalOpen(false);
      setFormData({
        name: "",
        employee_id: "",
        email: "",
        password: "",
        phone: "",
        department_id: departments[0]?._id || "",
        designation: "Assistant Professor",
        qualification: "M.Tech / Ph.D",
      });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to create tutor");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (tutor) => {
    setSelectedTutor(tutor);
    setSelectedClassIds(tutor.assigned_class_ids || []);
    setSelectedSubjectIds(tutor.assigned_subject_ids || []);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignments = async (e) => {
    e.preventDefault();
    if (!selectedTutor) return;
    setLoading(true);
    try {
      await tutorsAPI.updateAssignments(selectedTutor._id, {
        class_ids: selectedClassIds,
        subject_ids: selectedSubjectIds,
      });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Faculty & Tutor Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage teaching faculty, subject workloads, and class assignments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add New Tutor
        </button>
      </div>

      {/* Tutors Grid */}
      {tutors.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No faculty registered yet"
          description="Add faculty members and allocate classes and subjects to enable attendance marking."
          actionText="Add First Tutor"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tutors.map((t) => (
            <div key={t._id} className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-base">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.name}</h4>
                      <p className="text-[11px] text-purple-400 font-mono font-medium">{t.employee_id}</p>
                    </div>
                  </div>
                  <Badge variant="purple">{t.designation || "Faculty"}</Badge>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5" /> <span>{t.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <BookOpen className="w-3.5 h-3.5" /> <span>Dept: <strong className="text-white">{t.department_name || "General"}</strong></span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block mb-1">Assigned Classes ({t.assigned_class_ids?.length || 0})</span>
                  <div className="flex flex-wrap gap-1">
                    {t.assigned_class_ids?.length > 0 ? (
                      t.assigned_class_ids.map((cid) => {
                        const c = classes.find((cl) => cl._id === cid);
                        return c ? <span key={cid} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300 border border-slate-800">{c.name}</span> : null;
                      })
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No classes assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenAssign(t)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition"
              >
                Configure Workload
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Tutor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Faculty Member" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Faculty Name</label>
              <input
                type="text"
                required
                placeholder="Dr. S. Vignesh"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Employee ID</label>
              <input
                type="text"
                required
                placeholder="FAC_AI_042"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Official Email</label>
              <input
                type="email"
                required
                placeholder="vignesh@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Department</label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Designation</label>
              <input
                type="text"
                placeholder="Associate Professor"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
            >
              {loading ? "Registering..." : "Create Tutor Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Classes Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Configure Workload - ${selectedTutor?.name}`} maxWidth="max-w-xl">
        <form onSubmit={handleSaveAssignments} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Select Assigned Classes
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-900 border border-slate-800">
              {classes.map((c) => (
                <label key={c._id} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedClassIds.includes(c._id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedClassIds([...selectedClassIds, c._id]);
                      else setSelectedClassIds(selectedClassIds.filter((id) => id !== c._id));
                    }}
                    className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
            >
              {loading ? "Saving..." : "Save Workload"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
