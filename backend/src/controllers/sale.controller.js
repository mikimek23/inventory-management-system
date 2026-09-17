import {
  cancelSaleService,
  completeSaleService,
  createSaleService,
  getSaleService,
  getSalesService,
} from "../services/sale.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSalesController = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await getSalesService() });
});

export const getSaleController = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await getSaleService(req.params.id) });
});

export const createSaleController = asyncHandler(async (req, res) => {
  const sale = await createSaleService(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Sale created successfully", data: sale });
});

export const completeSaleController = asyncHandler(async (req, res) => {
  const sale = await completeSaleService(req.params.id);
  res.status(200).json({ success: true, message: "Sale completed successfully", data: sale });
});

export const cancelSaleController = asyncHandler(async (req, res) => {
  const sale = await cancelSaleService(req.params.id);
  res.status(200).json({ success: true, message: "Sale cancelled successfully", data: sale });
});
