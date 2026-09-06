import React, { useState, useEffect } from "react";
import { academicsAPI, tutorsAPI } from "../../api/services";
import { Modal } from "../../components/common/Modal";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Plus, BookOpen, Layers, GraduationCap, Building2 } from "lucide-react";

export const ClassSubjectManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [isDeptModal, setIsDeptModal] = useState(false);
  const [isClassModal, setIsClassModal] = useState(false);
  const [isSubjectModal, setIsSubjectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: "", code: "", description: "" });
  const [classForm, setClassForm] = useState({ department_id: "", name: "", year: 2, section: "A", academic_year: "2026-2027" });
  const [subjectForm, setSubjectForm] = useState({ class_id: "", name: "", code: "", credits: 3, total_planned_hours: 45, tutor_id: "" });

  const fetchData = async () => {
    try {
      const [dRes, cRes, sRes, tRes] = await Promise.all([
        academicsAPI.getDepartments(),
        academicsAPI.getClasses(),
        academicsAPI.getSubjects(),
        tutorsAPI.getTutors(),
      ]);
      setDepartments(dRes.data);
      setClasses(cRes.data);
      setSubjects(sRes.data);
      setTutors(tRes.data);

      if (dRes.data.length > 0 && !classForm.department_id) {
        setClassForm((prev) => ({ ...prev, department_id: dRes.data[0]._id }));
      }
      if (cRes.data.length > 0 && !subjectForm.class_id) {
        setSubjectForm((prev) => ({ ...prev, class_id: cRes.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await academicsAPI.createDepartment(deptForm);
      setIsDeptModal(false);
      setDeptForm({ name: "", code: "", description: "" });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await academicsAPI.createClass(classForm);
      setIsClassModal(false);
      setClassForm({ department_id: departments[0]?._id || "", name: "", year: 2, section: "A", academic_year: "2026-2027" });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await academicsAPI.createSubject(subjectForm);
      setIsSubjectModal(false);
      setSubjectForm({ class_id: classes[0]?._id || "", name: "", code: "", credits: 3, total_planned_hours: 45, tutor_id: "" });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Curriculum & Academic Structure</h2>
          <p className="text-xs text-slate-400 mt-0.5">Define departments, degree classes, semester subjects, and teaching allocations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeptModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" /> Department
          </button>
          <button
            onClick={() => setIsClassModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Class
          </button>
          <button
            onClick={() => setIsSubjectModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Subject
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" /> Active Classes & Cohorts
        </h3>
        {classes.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No classes created yet"
            description="Create class cohorts such as 'II B.Sc AI & ML' to begin enrolling students."
            actionText="Create First Class"
            onAction={() => setIsClassModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((c) => (
              <div key={c._id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-base">{c.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{c.department_name || "General Department"}</p>
                    </div>
                    <Badge variant="cyan">Year {c.year} - Sec {c.section}</Badge>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex justify-between">
                    <span className="text-slate-400">Enrolled Students</span>
                    <span className="font-extrabold text-white font-mono">{c.total_students || 0}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                  Academic Year: {c.academic_year}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subjects Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" /> Course Subjects
        </h3>
        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects registered"
            description="Add course subjects (e.g. Python Programming, Machine Learning) and assign faculty."
            actionText="Add First Subject"
            onAction={() => setIsSubjectModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((s) => (
              <div key={s._id} className="glass-card rounded-2xl p-5 border border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <p className="text-xs font-mono text-purple-400 mt-0.5">{s.code}</p>
                  </div>
                  <Badge variant="purple">{s.credits} Credits</Badge>
                </div>
                <div className="mt-4 text-xs space-y-1 text-slate-300">
                  <div>Class: <strong className="text-white">{s.class_name}</strong></div>
                  <div>Faculty: <strong className="text-indigo-400">{s.tutor_name || "Unassigned"}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dept Modal */}
      <Modal isOpen={isDeptModal} onClose={() => setIsDeptModal(false)} title="Create Department" maxWidth="max-w-md">
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Department Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence & Machine Learning"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Department Code</label>
            <input
              type="text"
              required
              placeholder="e.g. AI_ML"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button type="button" onClick={() => setIsDeptModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">{loading ? "Saving..." : "Create Department"}</button>
          </div>
        </form>
      </Modal>

      {/* Create Class Modal */}
      <Modal isOpen={isClassModal} onClose={() => setIsClassModal(false)} title="Create Class Cohort" maxWidth="max-w-md">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Class Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. II B.Sc AI & ML"
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Department</label>
            <select
              required
              value={classForm.department_id}
              onChange={(e) => setClassForm({ ...classForm, department_id: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Year</label>
              <select
                value={classForm.year}
                onChange={(e) => setClassForm({ ...classForm, year: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Section</label>
              <input
                type="text"
                value={classForm.section}
                onChange={(e) => setClassForm({ ...classForm, section: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase"
              />
            </div>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button type="button" onClick={() => setIsClassModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">{loading ? "Saving..." : "Create Class"}</button>
          </div>
        </form>
      </Modal>

      {/* Create Subject Modal */}
      <Modal isOpen={isSubjectModal} onClose={() => setIsSubjectModal(false)} title="Register Course Subject" maxWidth="max-w-md">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Subject Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Python Programming"
              value={subjectForm.name}
              onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Subject Code</label>
            <input
              type="text"
              required
              placeholder="e.g. CS201"
              value={subjectForm.code}
              onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Class Cohort</label>
            <select
              required
              value={subjectForm.class_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, class_id: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            >
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Assign Faculty / Tutor</label>
            <select
              value={subjectForm.tutor_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, tutor_id: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
            >
              <option value="">-- Assign Later --</option>
              {tutors.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.employee_id})</option>)}
            </select>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button type="button" onClick={() => setIsSubjectModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">{loading ? "Saving..." : "Create Subject"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
