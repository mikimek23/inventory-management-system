import prisma from "../config/database.js";

export const getPurchases = async () => {
  return prisma.purchase.findMany({
    include: {
      supplier: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: {
      transactionDate: "desc",
    },
  });
};
export const getPurchaseById = async (id) => {
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      purchaseItems: { include: { product: true } },
    },
  });
};
export const getPurchaseByRN = async (referenceNumber) => {
  return prisma.purchase.findUnique({ where: { referenceNumber } });
};
export const createPurchase = async (tx, data) => {
  return tx.purchase.create({ data });
};
export const createPurchaseItems = async (tx, data) => {
  return tx.purchaseItem.createMany({ data });
};
export const updatePurchase = async (tx, PurchaseId, data) => {
  return tx.purchase.update({ where: { id: PurchaseId }, data });
};
export const deletePurchaseItems = async (tx, purchaseId) => {
  return tx.purchaseItem.deleteMany({
    where: {
      purchaseId,
    },
  });
};
