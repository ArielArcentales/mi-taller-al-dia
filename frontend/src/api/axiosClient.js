import axios from "axios";

let envUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const cleanUrl = envUrl.replace(/['"[\]]/g, "").trim();

const axiosClient = axios.create({
  baseURL: cleanUrl,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
