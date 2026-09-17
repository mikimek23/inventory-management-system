import api, { unwrap } from "./api";

export const customerApi = {
  getAll: (params) => unwrap(api.get("/customers", { params })),
  create: (data) => unwrap(api.post("/customers", data)),
  update: (id, data) => unwrap(api.patch(`/customers/${id}`, data)),
  toggleStatus: (id) => unwrap(api.patch(`/customers/${id}/status`)),
};

export default customerApi;
