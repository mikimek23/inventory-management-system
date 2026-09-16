import prisma from "../config/database.js";

export const getCategories = async () => {
  return prisma.category.findMany();
};
export const getCategoryById = async (id) => {
  return prisma.category.findUnique({ where: { id } });
};
export const getCategoryByName = async (name) => {
  return prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
};
export const getCategoryByCode = async (code) => {
  return prisma.category.findUnique({ where: { code } });
};
export const createCategory = async (data) => {
  return prisma.category.create({ data });
};
export const updateCategory = async (categoryId, data) => {
  return prisma.category.update({ where: { id: categoryId }, data });
};
