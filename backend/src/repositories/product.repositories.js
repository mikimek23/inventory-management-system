import prisma from "../config/database.js";
export const getProducts = async (filters = {}) => {
  const { search, categoryId, status } = filters;
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (status) {
    where.status = status;
  }
  return prisma.product.findMany({ where, orderBy: { createdAt: "desc" } });
};

export const getProduct = async (id) => {
  return prisma.product.findUnique({ where: { id } });
};
export const getProductBySku = async (sku) => {
  return prisma.product.findUnique({ where: { sku } });
};
export const createProduct = async (db,data) => {
  return db.product.create({data});
};
export const updateProduct = async (productId, data) => {
  return prisma.product.update({ where: { id: productId }, data });
};
export const incrementCategorySkuSequence = async (db, categoryId) => {
  return db.category.update({
    where: { id: categoryId },
    data: { skuSequence: { increment: 1 } },
  });
};
