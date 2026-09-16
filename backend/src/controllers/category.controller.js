import {
  createCategoryService,
  getCategoriesService,
  getCategoryService,
  updateCategoryService,
  updateCategoryStatusService,
} from "../services/category.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCategoriesController = async (req, res) => {
  const response = await getCategoriesService();
  res.status(200).json({
    success: true,
    data: response,
  });
};
export const getCategoryController = asyncHandler(async (req, res) => {
  const response = await getCategoryService(req.params.id);
  res.status(200).json({
    success: true,
    data: response,
  });
});
export const createCategoryController = asyncHandler(async (req, res) => {
  const response = await createCategoryService(req.body);
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: response,
  });
});
export const updateCategoryController = asyncHandler(async (req, res) => {
  const response = await updateCategoryService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: response,
  });
});
export const updateCategoryStatusController = asyncHandler(async (req, res) => {
  const response = await updateCategoryStatusService(req.params.id);
  res.status(200).json({
    success: true,
    message: "Category status updated successfully",
    data: response,
  });
});
