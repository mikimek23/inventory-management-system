import {
  createCategoryService,
  getCategoriesService,
  getCategoryService,
  updateCategoryService,
  updateCategoryStatusService,
} from "../services/category.service.js";

export const getCategoriesController = async (req, res) => {
  const response = await getCategoriesService();
  res.status(200).json({
    success: true,
    data: response,
  });
};
export const getCategoryController = async (req, res) => {
  const response = await getCategoryService(req.params.id);
  res.status(200).json({
    success: true,
    data: response,
  });
};
export const createCategoryController = async (req, res) => {
  const response = await createCategoryService(req.body);
  res.status(201).json({
    success: true,
    message: "Category created successfuly",
    data: response,
  });
};
export const updateCategoryController = async (req, res) => {
  const response = await updateCategoryService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Category updated successfuly",
    data: response,
  });
};
export const updateCategoryStatusController = async (req, res) => {
  const response = await updateCategoryStatusService(req.params.id);
  res.status(200).json({
    success: true,
    message: "Category status updated successfuly",
    data: response,
  });
};
