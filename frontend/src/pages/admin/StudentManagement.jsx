import React, { useState, useEffect } from "react";
import { studentsAPI, academicsAPI } from "../../api/services";
import { Modal } from "../../components/common/Modal";
import { Badge } from "../../components/common/Badge";
import { EmptyState } from "../../components/common/EmptyState";
import { Plus, Search, UserPlus, Mail, Phone, BookOpen, Shield, Power } from "lucide-react";

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    register_number: "",
    email: "",
    password: "",
    phone: "",
    class_id: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    parent_relation: "Father",
    address: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await studentsAPI.getStudents({ search: search || undefined, class_id: classFilter || undefined });
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await academicsAPI.getClasses();
      setClasses(res.data);
      if (res.data.length > 0 && !formData.class_id) {
        setFormData((prev) => ({ ...prev, class_id: res.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [search, classFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentsAPI.createStudent(formData);
      setIsModalOpen(false);
      setFormData({
        name: "",
        register_number: "",
        email: "",
        password: "",
        phone: "",
        class_id: classes[0]?._id || "",
        parent_name: "",
        parent_email: "",
        parent_phone: "",
        parent_relation: "Father",
        address: "",
      });
      fetchStudents();
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      await studentsAPI.toggleStatus(id, nextStatus);
      fetchStudents();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Student Directory & Parent Linking</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage registered students, parent bindings, and portal access</p>
        </div>
        <button
          onClick={() => {
            fetchClasses();
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add New Student
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or register no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full sm:w-60 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="">All Classes / Sections</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {students.length === 0 ? (
          <EmptyState
            title="No student data available yet"
            description="Start by adding students and assigning them to classes. Parent accounts will be automatically created and linked."
            actionText="Add First Student"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Register No</th>
                  <th className="px-5 py-3.5">Class / Section</th>
                  <th className="px-5 py-3.5">Parent Details</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white text-sm">{st.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" /> {st.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-400">{st.register_number}</td>
                    <td className="px-5 py-3.5 text-slate-300 font-medium">{st.class_name || "Unassigned"}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-200 font-semibold">{st.parent_name || "Not Linked"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{st.parent_email || st.parent_phone || ""}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={st.status === "ACTIVE" ? "success" : "danger"}>{st.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(st._id, st.status)}
                        title={st.status === "ACTIVE" ? "Disable Account" : "Enable Account"}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                          st.status === "ACTIVE" ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Student & Link Parent" maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Student Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Arun Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Register Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 26AIML001"
                value={formData.register_number}
                onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Student Email</label>
              <input
                type="email"
                required
                placeholder="arun@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Login Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Class Assignment</label>
              <select
                required
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {classes.length === 0 ? (
                  <option value="">-- No Classes Found (Create Class First) --</option>
                ) : (
                  <>
                    <option value="">-- Select Class Cohort --</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </>
                )}
              </select>
              {classes.length === 0 && (
                <p className="text-[10px] text-amber-400 mt-1">⚠️ Please add classes in 'Curriculum & Classes' first.</p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Student Phone</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Parent Information (Auto Linked)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Parent Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Parent Email</label>
                <input
                  type="email"
                  placeholder="parent.ramesh@gmail.com"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Parent Phone</label>
                <input
                  type="text"
                  placeholder="+91 91234 56789"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
            >
              {loading ? "Registering..." : "Create Student & Link Parent"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
