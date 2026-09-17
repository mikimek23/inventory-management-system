import api, { unwrap } from "./api";

export const purchaseApi = {
  getAll: (params) => unwrap(api.get("/purchases", { params })),
  getById: (id) => unwrap(api.get(`/purchases/${id}`)),
  create: (data) => unwrap(api.post("/purchases", data)),
  update: (id, data) => unwrap(api.patch(`/purchases/${id}`, data)),
  complete: (id) => unwrap(api.patch(`/purchases/${id}/complete`)),
  cancel: (id) => unwrap(api.patch(`/purchases/${id}/cancel`)),
};

export default purchaseApi;
