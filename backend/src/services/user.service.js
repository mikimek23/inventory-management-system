import {
  getUserById,
  getUsers,
  updateUser,
} from "../repositories/user.repositories.js";
import AppError from "../utils/AppError.js";

export const getUsersService = async () => {
  const users = await getUsers();
  return users.map((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  });
};
export const getUserService = async (id) => {
  const user = await getUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
};

export const updateUserRoleService = async (userId, role) => {
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }
  const updatedUser = await updateUser(userId, role);
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.status,
    createdAt: updatedUser.createdAt,
  };
};
export const updateUserStatusService = async (userId, status) => {
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }
  const updatedUser = await updateUser(userId, status);
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.status,
    createdAt: updatedUser.createdAt,
  };
};
