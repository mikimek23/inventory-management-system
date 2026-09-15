import prisma from "../config/database.js";

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};
export const createUser = async (data) => {
  return prisma.user.create({ data });
};
export const updateRefreshToken = async (
  userId,
  refreshToken,
  refreshTokenExpires,
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: refreshToken,
      refreshTokenExpires: refreshTokenExpires,
    },
  });
};
export const findUserById = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};
export const clearRefreshToken = async (userId) => {
  return prisma.user.update({
    wher: { id: userId },
    data: {
      refreshToken: null,
      refreshTokenExpires: null,
    },
  });
};
