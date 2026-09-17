import api, { unwrap } from "./api";

export const categoryApi = {
  getAll: (params) => unwrap(api.get("/categories", { params })),
  getById: (id) => unwrap(api.get(`/categories/${id}`)),
  create: (data) => unwrap(api.post("/categories", data)),
  update: (id, data) => unwrap(api.patch(`/categories/${id}`, data)),
  toggleStatus: (id) => unwrap(api.post(`/categories/${id}/status`)),
};

export default categoryApi;
