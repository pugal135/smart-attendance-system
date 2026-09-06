import apiClient from "./client";

export const authAPI = {
  login: (data) => apiClient.post("/auth/login", data),
  getMe: () => apiClient.get("/auth/me"),
};

export const academicsAPI = {
  getDepartments: () => apiClient.get("/academics/departments"),
  createDepartment: (data) => apiClient.post("/academics/departments", data),
  getClasses: (deptId) => apiClient.get("/academics/classes", { params: { department_id: deptId } }),
  createClass: (data) => apiClient.post("/academics/classes", data),
  getClassStudents: (classId) => apiClient.get(`/academics/classes/${classId}/students`),
  getSubjects: (classId, tutorId) => apiClient.get("/academics/subjects", { params: { class_id: classId, tutor_id: tutorId } }),
  createSubject: (data) => apiClient.post("/academics/subjects", data),
};

export const studentsAPI = {
  getStudents: (params) => apiClient.get("/students", { params }),
  getStudentDetails: (id) => apiClient.get(`/students/${id}`),
  createStudent: (data) => apiClient.post("/students", data),
  toggleStatus: (id, status) => apiClient.patch(`/students/${id}/status`, null, { params: { status } }),
};

export const tutorsAPI = {
  getTutors: (deptId) => apiClient.get("/tutors", { params: { department_id: deptId } }),
  createTutor: (data) => apiClient.post("/tutors", data),
  updateAssignments: (tutorId, data) => apiClient.put(`/tutors/${tutorId}/assignments`, data.class_ids, { params: { subject_ids: data.subject_ids } }),
};

export const parentsAPI = {
  getParents: () => apiClient.get("/parents"),
  getMyWards: () => apiClient.get("/parents/my-wards"),
};

export const attendanceAPI = {
  submitBatch: (data) => apiClient.post("/attendance/batch", data),
  getRecords: (params) => apiClient.get("/attendance/records", { params }),
  overrideRecord: (id, data) => apiClient.put(`/attendance/${id}/override`, null, { params: data }),
};

export const qrAPI = {
  createSession: (data) => apiClient.post("/qr/create-session", data),
  scanQR: (data) => apiClient.post("/qr/scan", data),
  getLiveFeed: (sessionId) => apiClient.get(`/qr/${sessionId}/live-feed`),
};

export const leavesAPI = {
  applyLeave: (data) => apiClient.post("/leaves/apply", data),
  getLeaves: (params) => apiClient.get("/leaves", { params }),
  reviewLeave: (id, data) => apiClient.patch(`/leaves/${id}/review`, data),
};

export const finesAPI = {
  getFines: (params) => apiClient.get("/fines", { params }),
  evaluateAll: () => apiClient.post("/fines/evaluate-all"),
};

export const paymentsAPI = {
  createOrder: (data) => apiClient.post("/payments/create-order", data),
  verifyPayment: (data) => apiClient.post("/payments/verify", data),
};

export const clearanceAPI = {
  getClearances: (params) => apiClient.get("/clearance", { params }),
  verifyClearance: (id, data) => apiClient.patch(`/clearance/${id}/verify`, data),
};

export const analyticsAPI = {
  getAdminSummary: () => apiClient.get("/analytics/admin-summary"),
  getStudentAnalytics: (studentId) => apiClient.get(`/analytics/student/${studentId}`),
  getAcademicPrediction: (studentId) => apiClient.get(`/analytics/academic-prediction/${studentId}`),
  calculateRecovery: (studentId, targetPct, classesToAttend) =>
    apiClient.post("/analytics/recovery-calculator", null, {
      params: { student_id: studentId, target_percentage: targetPct, classes_to_attend: classesToAttend },
    }),
};

export const notificationsAPI = {
  getNotifications: () => apiClient.get("/notifications"),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch("/notifications/mark-all-read"),
};

export const settingsAPI = {
  getSettings: () => apiClient.get("/settings"),
  updateSettings: (data) => apiClient.put("/settings", data),
};

export const auditAPI = {
  getLogs: (params) => apiClient.get("/audit", { params }),
};

export const adminAPI = {
  getRecentActivities: () => apiClient.get("/admin/recent-activities"),
};
