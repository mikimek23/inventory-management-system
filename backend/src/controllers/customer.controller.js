import {
  createCustomerService,
  getCustomersService,
  updateCustomerService,
  updateCustomerStatusService,
} from "../services/customer.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCustomersController = asyncHandler(async (req, res) => {
  const response = await getCustomersService();
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const createCustomerController = asyncHandler(async (req, res) => {
  const response = await createCustomerService(req.body);
  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: response,
  });
});
export const updateCustomerController = asyncHandler(async (req, res) => {
  const response = await updateCustomerService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: response,
  });
});
export const updateCustomerStatusController = asyncHandler(async (req, res) => {
  const response = await updateCustomerStatusService(req.params.id);
  res.status(200).json({
    success: true,
    message: "Customer status updated successfully",
    data: response,
  });
});
