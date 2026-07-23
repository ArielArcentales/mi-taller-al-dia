import axios from "axios";

const axiosClient = axios.create({
  // Escribimos la URL directamente para ignorar las variables de entorno de Netlify
  baseURL: "https://mi-taller-al-dia-backend.onrender.com/api",
});

// Interceptor para inyectar el token automáticamente
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
