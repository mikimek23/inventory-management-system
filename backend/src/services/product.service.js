import { standardProps } from "zod/v4/core";
import prisma from "../config/database.js";
import { getCategoryById } from "../repositories/category.repositories.js";
import {
  createProduct,
  getProduct,
  getProducts,
  incrementCategorySkuSequence,
  updateProduct,
} from "../repositories/product.repositories.js";
import { createStockAdjustment } from "../repositories/stock.repositories.js";
import AppError from "../utils/AppError.js";

export const getProductsService = async (filters) => {
  const products =await getProducts(filters);
  return products;
};
export const getProductService = async (id) => {
  const product =await getProduct(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
};
export const createProductService = async (createdById, data) => {
  return prisma.$transaction(async (tx) => {
    const category = await getCategoryById(data.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    if (category.status === "INACTIVE") {
      throw new AppError(
        "Cannot create a product under an inactive category",
        400,
      );
    }
    const updatedCategory = await incrementCategorySkuSequence(
      tx,
      data.categoryId,
    );
    const sku = `${category.code}-${String(updatedCategory.skuSequence).padStart(6, "0")}`;
    const product = await createProduct(tx, {
      name: data.name,
      categoryId: data.categoryId,
      sku,
      unit: data.unit,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      minimumStock: data.minimumStock,
    });
    if (data.quantity > 0) {
      await createStockAdjustment(tx, {
        productId: product.id,
        createdById,
        type: "INCREASE",
        quantity: data.quantity,
        reason: "Opening stock",
      });
    }
    return product;
  });
};
export const updateProductService = async (productId, data) => {
  const product = await getProduct(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  if (data.categoryId && product.categoryId !== data.categoryId) {
    const category = await getCategoryById(data.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    if (category.status === "INACTIVE") {
      throw new AppError(
        "Cannot move product to an inactive category",
        400,
      );
    }
  }
  const updatedProduct = await updateProduct(productId, data);
  return updatedProduct;
};
export const updateProductStatusService = async (productId) => {
  const product = await getProduct(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  const status = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const updatedProduct = await updateProduct(productId, { status });
  return updatedProduct;
};
