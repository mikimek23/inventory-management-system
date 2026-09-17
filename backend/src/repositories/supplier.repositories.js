import prisma from "../config/database.js";

export const getSuppliers = async () => {
  return prisma.supplier.findMany();
};
export const getSupplierById = async (id) => {
  return prisma.supplier.findUnique({ where: { id } });
};
export const createSupplier = async (data) => {
  return prisma.supplier.create({ data });
};
export const updateSupplier = async (supplierId, data) => {
  return prisma.supplier.update({ where: { id: supplierId }, data });
};
