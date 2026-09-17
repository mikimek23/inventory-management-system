import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("inventory_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshingPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshingPromise) {
        refreshingPromise = api
          .post("/auth/refresh")
          .then((res) => {
            const token = res.data?.data?.accessToken;
            if (token) {
              localStorage.setItem("inventory_access_token", token);
            }
            return token;
          })
          .finally(() => {
            refreshingPromise = null;
          });
      }

      const newToken = await refreshingPromise;
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      return Promise.reject(error);
    } catch (refreshErr) {
      localStorage.removeItem("inventory_access_token");
      localStorage.removeItem("inventory_user");
      return Promise.reject(refreshErr);
    }
  }
);

export const unwrap = (promise) => promise.then((res) => res.data?.data);

export const apiError = (error) => {
  if (error?.response?.data?.errors?.length) {
    return error.response.data.errors.map((e) => e.message).join(", ");
  }
  return (
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred."
  );
};

export default api;
