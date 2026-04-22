import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 300000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const sendQuery   = (query) => api.post("/query", { query });
export const getTopics   = ()      => api.get("/topics");
export const signup      = (data)  => api.post("/auth/signup", data);
export const login       = (data)  => api.post("/auth/login", data);
export const getProgress = ()      => api.get("/progress");

export default api;