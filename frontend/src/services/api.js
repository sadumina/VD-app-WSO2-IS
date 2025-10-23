import axios from "axios";

const API = axios.create({
  baseURL: "https://fueltracker-gtyc.onrender.com/api",  // ✅ added /api
});

// Add token to all requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
