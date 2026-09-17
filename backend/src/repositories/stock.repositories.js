import prisma from "../config/database.js";

export const getCompletedPurchaseQuantity = async (productId, db = prisma) => {
  const result = await db.purchaseItem.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      productId,
      purchase: {
        status: "COMPLETED",
      },
    },
  });

  return result._sum.quantity ?? 0;
};

export const getCompletedSaleQuantity = async (productId, db = prisma) => {
  const result = await db.saleItem.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      productId,
      sale: {
        status: "COMPLETED",
      },
    },
  });

  return result._sum.quantity ?? 0;
};

export const getAdjustmentQuantity = async (productId, type, db = prisma) => {
  const result = await db.stockAdjustment.aggregate({
    _sum: { quantity: true },
    where: { productId, type },
  });

  return result._sum.quantity ?? 0;
};

export const createStockAdjustment = async (db, data) => {
  return db.stockAdjustment.create({ data });
};

export const getStockAdjustments = async (filters = {}) => {
  const { productId, type, from, to } = filters;
  const where = {
    ...(productId && { productId }),
    ...(type && { type }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(`${to}T23:59:59.999Z`) }),
      },
    }),
  };

  return prisma.stockAdjustment.findMany({
    where,
    include: {
      product: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getActiveProductsForStock = async () => {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      sku: true,
      unit: true,
      minimumStock: true,
    },
    orderBy: { name: "asc" },
  });
};
