import api, { unwrap } from "./api";

export const authApi = {
  login: (credentials) => unwrap(api.post("/auth/login", credentials)),
  logout: () => api.post("/auth/logout"),
  getProfile: () => unwrap(api.get("/auth/me")),
  refresh: () => unwrap(api.post("/auth/refresh")),
};

export default authApi;
