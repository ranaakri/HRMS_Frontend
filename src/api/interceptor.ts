import api from "./api";

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.post("/refresh");
        const token = res.data.accessToken;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Referesh faild");
        window.location.href = "/login"
      }
    }
    return Promise.reject(error);
  },
);
