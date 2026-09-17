import {
  createSupplierService,
  getSuppliersService,
  updateSupplierService,
  updateSupplierStatusService,
} from "../services/supplier.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSuppliersController = asyncHandler(async (req, res) => {
  const response = await getSuppliersService();
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const createSupplierController = asyncHandler(async (req, res) => {
  const response = await createSupplierService(req.body);
  res.status(201).json({
    success: true,
    message: "Supplier created successfully",
    data: response,
  });
});
export const updateSupplierController = asyncHandler(async (req, res) => {
  const response = await updateSupplierService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Supplier updated successfully",
    data: response,
  });
});
export const updateSupplierStatusController = asyncHandler(async (req, res) => {
  const response = await updateSupplierStatusService(req.params.id);
  res.status(200).json({
    success: true,
    message: "Supplier status updated successfully",
    data: response,
  });
});
