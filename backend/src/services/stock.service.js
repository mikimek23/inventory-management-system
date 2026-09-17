import {
  createStockAdjustment,
  getActiveProductsForStock,
  getAdjustmentQuantity,
  getCompletedPurchaseQuantity,
  getCompletedSaleQuantity,
  getStockAdjustments,
} from "../repositories/stock.repositories.js";
import { getProduct } from "../repositories/product.repositories.js";
import prisma from "../config/database.js";
import { Prisma } from "../generated/prisma/client.ts";
import AppError from "../utils/AppError.js";

export const getProductStockService = async (productId, db) => {
  const [purchaseQuantity, saleQuantity, increaseQuantity, decreaseQuantity] =
    await Promise.all([
      getCompletedPurchaseQuantity(productId, db),
      getCompletedSaleQuantity(productId, db),
      getAdjustmentQuantity(productId, "INCREASE", db),
      getAdjustmentQuantity(productId, "DECREASE", db),
    ]);

  return new Prisma.Decimal(purchaseQuantity ?? 0)
    .plus(increaseQuantity ?? 0)
    .minus(saleQuantity ?? 0)
    .minus(decreaseQuantity ?? 0);
};

export const getStockListService = async (lowStock = false) => {
  const products = await getActiveProductsForStock();
  const productsWithStock = await Promise.all(
    products.map(async (product) => ({
      ...product,
      currentStock: await getProductStockService(product.id),
    })),
  );

  if (!lowStock) return productsWithStock;

  return productsWithStock.filter((product) =>
    product.currentStock.lessThanOrEqualTo(product.minimumStock),
  );
};

export const createStockAdjustmentService = async (createdById, data) => {
  return prisma.$transaction(async (tx) => {
    const product = await getProduct(data.productId, tx);
    if (!product) throw new AppError("Product not found", 404);
    if (product.status === "INACTIVE") {
      throw new AppError("Cannot adjust an inactive product", 403);
    }

    if (data.type === "DECREASE") {
      const currentStock = await getProductStockService(data.productId, tx);
      if (currentStock.lessThan(data.quantity)) {
        throw new AppError("Insufficient stock for this adjustment", 409);
      }
    }

    return createStockAdjustment(tx, {
      productId: data.productId,
      createdById,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
    });
  });
};

export const getStockAdjustmentsService = async (filters) =>
  getStockAdjustments(filters);
