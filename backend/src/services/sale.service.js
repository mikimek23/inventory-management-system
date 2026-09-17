import prisma from "../config/database.js";
import { getCustomerById } from "../repositories/customer.repositories.js";
import { getProduct } from "../repositories/product.repositories.js";
import {
  createSale,
  createSaleItems,
  getSaleById,
  getSales,
  updateSale,
} from "../repositories/sale.repositories.js";
import { getProductStockService } from "./stock.service.js";
import AppError from "../utils/AppError.js";
import { generateSaleRF } from "../utils/referenceNumber.js";

const validateSaleItems = async (items, db = prisma) => {
  for (const item of items) {
    const product = await getProduct(item.productId, db);
    if (!product) throw new AppError("Product not found", 404);
    if (product.status === "INACTIVE") {
      throw new AppError("Cannot sell an inactive product", 403);
    }
  }
};

export const getSalesService = async () => getSales();

export const getSaleService = async (saleId) => {
  const sale = await getSaleById(saleId);
  if (!sale) throw new AppError("Sale not found", 404);
  return sale;
};

export const createSaleService = async (createdById, data) => {
  return prisma.$transaction(async (tx) => {
    if (data.customerId) {
      const customer = await getCustomerById(data.customerId, tx);
      if (!customer) throw new AppError("Customer not found", 404);
      if (customer.status === "INACTIVE") {
        throw new AppError("Cannot create a sale for an inactive customer", 403);
      }
    }

    await validateSaleItems(data.items, tx);
    const items = data.items.map((item) => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    }));
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const sale = await createSale(tx, {
      ...(data.customerId && { customerId: data.customerId }),
      createdById,
      referenceNumber: await generateSaleRF(tx),
      ...(data.notes !== undefined && { notes: data.notes }),
      total,
    });
    await createSaleItems(
      tx,
      items.map((item) => ({ ...item, saleId: sale.id })),
    );
    return sale;
  });
};

export const completeSaleService = async (saleId) => {
  return prisma.$transaction(async (tx) => {
    const sale = await getSaleById(saleId, tx);
    if (!sale) throw new AppError("Sale not found", 404);
    if (sale.status !== "DRAFT") {
      throw new AppError("Only draft sales can be completed", 409);
    }

    for (const item of sale.saleItems) {
      const currentStock = await getProductStockService(item.productId, tx);
      if (currentStock.lessThan(item.quantity)) {
        throw new AppError("Insufficient stock to complete this sale", 409);
      }
    }

    return updateSale(tx, saleId, { status: "COMPLETED" });
  });
};

export const cancelSaleService = async (saleId) => {
  return prisma.$transaction(async (tx) => {
    const sale = await getSaleById(saleId, tx);
    if (!sale) throw new AppError("Sale not found", 404);
    if (sale.status !== "DRAFT") {
      throw new AppError("Only draft sales can be cancelled", 409);
    }
    return updateSale(tx, saleId, { status: "CANCELLED" });
  });
};
