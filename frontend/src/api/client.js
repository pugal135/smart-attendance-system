import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://smart-attendance-system-1-ggrz.onrender.com";
const API_BASE_URL = BASE_URL ? `${BASE_URL.replace(/\/$/, "")}/api/v1` : "/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smart_att_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("smart_att_token");
        localStorage.removeItem("smart_att_user");
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
