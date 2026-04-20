import axios from "axios";

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "") + "/api",
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Existing helpers ──────────────────────────────────────
export const askQuestion = (question) => {
  return API.post("/ask", { question }); // remove /api prefix
};

export default API;