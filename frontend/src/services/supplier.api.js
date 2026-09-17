import api, { unwrap } from "./api";

export const supplierApi = {
  getAll: (params) => unwrap(api.get("/suppliers", { params })),
  create: (data) => unwrap(api.post("/suppliers", data)),
  update: (id, data) => unwrap(api.patch(`/suppliers/${id}`, data)),
  toggleStatus: (id) => unwrap(api.patch(`/suppliers/${id}/status`)),
};

export default supplierApi;
