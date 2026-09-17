import {
  createStockAdjustmentService,
  getStockAdjustmentsService,
  getStockListService,
} from "../services/stock.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const getAdjustmentFilters = (query) => {
  const { productId, type, from, to } = query;
  if (type && !["INCREASE", "DECREASE"].includes(type)) {
    throw new AppError("Invalid adjustment type", 400);
  }
  if (from && Number.isNaN(Date.parse(from))) {
    throw new AppError("Invalid from date", 400);
  }
  if (to && Number.isNaN(Date.parse(to))) {
    throw new AppError("Invalid to date", 400);
  }
  return { productId, type, from, to };
};

export const getStockListController = asyncHandler(async (req, res) => {
  const lowStock = req.query.lowStock === "true";
  const stock = await getStockListService(lowStock);
  res.status(200).json({ success: true, data: stock });
});

export const createStockAdjustmentController = asyncHandler(async (req, res) => {
  const adjustment = await createStockAdjustmentService(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: "Stock adjustment created successfully",
    data: adjustment,
  });
});

export const getStockAdjustmentsController = asyncHandler(async (req, res) => {
  const adjustments = await getStockAdjustmentsService(getAdjustmentFilters(req.query));
  res.status(200).json({ success: true, data: adjustments });
});
