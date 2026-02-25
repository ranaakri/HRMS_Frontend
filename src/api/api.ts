// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8081/api",
  withCredentials: true,
});

export default api;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Interceptor triggered");
    console.log("Status:", error.response?.status);

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh failed");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);