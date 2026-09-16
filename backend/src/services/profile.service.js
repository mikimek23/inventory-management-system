import { getUserById, updateUser } from "../repositories/user.repositories.js";

export const updateProfileService = async (userId, data) => {
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    throw new AppError("User not found", 404);
  }
  const updatedUser = await updateUser(userId, data);
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.status,
    createdAt: updatedUser.createdAt,
  };
};