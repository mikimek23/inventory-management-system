import {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory,
} from "../repositories/category.repositories.js";
import AppError from "../utils/AppError.js";

export const getCategoriesService = async () => {
  const categories = await getCategories();
  return categories;
};
export const getCategoryService = async (id) => {
  const category = await getCategoryById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return category;
};

export const createCategoryService = async (data) => {
  const existCategory = await getCategoryByName(data.name);
  if (existCategory) {
    throw new AppError("Category already exist", 409);
  }
  const category = await createCategory(data);
  return category;
};
export const updateCategoryService = async (categoryId, data) => {
  const foundCategory = await getCategoryById(categoryId);

  if (!foundCategory) {
    throw new AppError("Category not found", 404);
  }
  if (data.name && data.name !== foundCategory.name) {
    const existCategory = await getCategoryByName(data.name);
    if (existCategory) {
      throw new AppError("Category aready exist", 409);
    }
  }
  const updatedCategory = await updateCategory(categoryId, data);
  return updatedCategory;
};
export const updateCategoryStatusService = async (categoryId) => {
  const existCategory = await getCategoryById(categoryId);
  if (!existCategory) {
    throw new AppError("Category not found", 404);
  }
  const status = existCategory.status == "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const updatedCategory = await updateCategory(categoryId, { status });
  return updatedCategory;
};
