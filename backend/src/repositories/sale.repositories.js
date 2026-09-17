import prisma from "../config/database.js";

export const getSales = async () => {
  return prisma.sale.findMany({
    include: {
      customer: true,
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
export const getSaleById = async (id, db = prisma) => {
  return db.sale.findUnique({
    where: { id },
    include: {
      customer: true,
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
      saleItems: { include: { product: true } },
    },
  });
};
export const getSaleByRN = async (referenceNumber, db = prisma) => {
  return db.sale.findUnique({ where: { referenceNumber } });
};
export const createSale = async (tx, data) => {
  return tx.sale.create({ data });
};
export const createSaleItems = async (tx, data) => {
  return tx.saleItem.createMany({ data });
};
export const updateSale = async (tx, saleId, data) => {
  return tx.sale.update({ where: { id: saleId }, data });
};
export const deleteSaleItems = async (tx, saleId) => {
  return tx.saleItem.deleteMany({
    where: {
      saleId,
    },
  });
};
