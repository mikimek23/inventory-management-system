import prisma from "../config/database.js";
export const getUsers = async () => {
  return prisma.user.findMany();
};
export const getUserById = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUser = async (userId, data) => {
  return prisma.user.update({ where: { id: userId }, data });
};
