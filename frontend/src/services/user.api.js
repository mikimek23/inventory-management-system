import api, { unwrap } from "./api";

export const userApi = {
  getAll: (params) => unwrap(api.get("/users", { params })),
  getById: (id) => unwrap(api.get(`/users/${id}`)),
  updateRole: (id, role) => unwrap(api.patch(`/users/${id}/role`, { role })),
  updateStatus: (id, status) =>
    unwrap(api.patch(`/users/${id}/status`, { status })),
};

export default userApi;
