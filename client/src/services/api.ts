import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const API_BASE_URL = `${API_ORIGIN.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
