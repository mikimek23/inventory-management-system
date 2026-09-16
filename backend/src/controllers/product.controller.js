import {
  createProductService,
  getProductService,
  getProductsService,
  updateProductService,
  updateProductStatusService,
} from "../services/product.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const getProductsController = asyncHandler(async (req, res) => {
  const response = await getProductsService(req.query);
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const getProductController = asyncHandler(async (req, res) => {
  const response = await getProductService(req.params.id);
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const createProductController = asyncHandler(async (req, res) => {
  const response = await createProductService(req.body);
  res.status(201).json({
    success: true,
    message: "product created successfully",
    data: response,
  });
});
export const updateProductController = asyncHandler(async (req, res) => {
  const response = await updateProductService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "product updated successfully",
    data: response,
  });
});
export const updateProductStatusController = asyncHandler(async (req, res) => {
  const response = await updateProductStatusService(req.params.id);
  res.status(200).json({
    success: true,
    message: "product status updated successfully",
    data: response,
  });
});
