import api, { unwrap } from "./api";

export const saleApi = {
  getAll: (params) => unwrap(api.get("/sales", { params })),
  getById: (id) => unwrap(api.get(`/sales/${id}`)),
  create: (data) => unwrap(api.post("/sales", data)),
  update: (id, data) => unwrap(api.patch(`/sales/${id}`, data)),
  complete: (id) => unwrap(api.patch(`/sales/${id}/complete`)),
  cancel: (id) => unwrap(api.patch(`/sales/${id}/cancel`)),
};

export default saleApi;
