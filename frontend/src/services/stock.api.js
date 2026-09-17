import api, { unwrap } from "./api";

export const stockApi = {
  getStockList: (params) => unwrap(api.get("/stock", { params })),
  getAdjustments: (params) => unwrap(api.get("/stock-adjustments", { params })),
  createAdjustment: (data) => unwrap(api.post("/stock-adjustments", data)),
};

export default stockApi;
