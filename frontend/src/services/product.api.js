import api, { unwrap } from "./api";

export const productApi = {
  getAll: (params) => unwrap(api.get("/products", { params })),
  getById: (id) => unwrap(api.get(`/products/${id}`)),
  create: (data) => unwrap(api.post("/products", data)),
  update: (id, data) => unwrap(api.patch(`/products/${id}`, data)),
  toggleStatus: (id) => unwrap(api.patch(`/products/${id}/status`)),
};

export default productApi;
