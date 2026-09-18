import api, { unwrap } from "./api";

export const authApi = {
  login: (credentials) => unwrap(api.post("/auth/login", credentials)),
  register: (data) => unwrap(api.post("/auth/register", data)),
  logout: () => api.post("/auth/logout"),
  getProfile: () => unwrap(api.get("/auth/me")),
  updateProfile: (data) => unwrap(api.patch("/profile", data)),
  refresh: () => unwrap(api.post("/auth/refresh")),
};

export default authApi;
