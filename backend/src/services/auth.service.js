import {
  createUser,
  findUserByEmail,
  findUserById,
  updateRefreshToken,
} from "../repositories/auth.repositories.js";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token.js";
const hashData = async (data) => {
  return bcrypt.hash(data, 10);
};
const compareData = async (data, hashedData) => {
  return bcrypt.compare(data, hashedData);
};
export const userRegisterService = async (data) => {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }
  const hashedPassword = await hashData(data.password);
  const newUser = {
    name: data.name,
    email: data.email,
    passwordHash: hashedPassword,
  };
  const user = await createUser(newUser);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
};
export const userLoginService = async (data) => {
  const foundUser = await findUserByEmail(data.email);
  if (!foundUser) {
    throw new AppError("Incorrect email or password", 401);
  }
  if (foundUser.status == "INACTIVE") {
    throw new AppError("User account is inactive", 403);
  }
  const isMatch = await compareData(data.password, foundUser.passwordHash);
  if (!isMatch) {
    throw new AppError("Incorrect email or password", 401);
  }
  const accessToken = generateAccessToken({
    id: foundUser.id,
    role: foundUser.role,
  });
  const refreshToken = generateRefreshToken({
    id: foundUser.id,
  });
  const hashedRefreshToken = await hashData(refreshToken);
  const payload = verifyRefreshToken(refreshToken);

  const user = await updateRefreshToken(
    foundUser.id,
    hashedRefreshToken,
    new Date(payload.exp * 1000),
  );
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    accessToken,
    refreshToken,
  };
};
export const refreshTokenService = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid referesh token", 403);
  }
  if (!payload) {
    throw new AppError("Invalid referesh token", 403);
  }
  const user = await findUserById(payload.id);
  if (!user || !user.refreshToken) {
    throw new AppError("invalid refresh token", 403);
  }
  if (user.status === "INACTIVE") {
    throw new AppError("User account is inactive", 403);
  }
  if (
    user.refreshTokenExpires &&
    user.refreshTokenExpires.getTime() < Date.now()
  ) {
    await updateRefreshToken(user.id, null, null);
    throw new AppError("Refresh token expired", 403);
  }
  const isMatch = await compareData(refreshToken, user.refreshToken);
  if (!isMatch) {
    throw new AppError("Invalid refresh token", 403);
  }
  const newAccessToken = generateAccessToken({
    id: user.id,
    role: user.role,
  });
  const newRefreshToken = generateRefreshToken({
    id: user.id,
  });
  const hashedRefreshToken = await hashData(newRefreshToken);
  const newPayload = verifyRefreshToken(newRefreshToken);

  const Updateduser = await updateRefreshToken(
    user.id,
    hashedRefreshToken,
    new Date(newPayload.exp * 1000),
  );
  return {
    id: Updateduser.id,
    name: Updateduser.name,
    email: Updateduser.email,
    role: Updateduser.role,
    status: Updateduser.status,
    createdAt: Updateduser.createdAt,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logOutService = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("No refresh token", 401);
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await findUserById(payload.id);
    if (!user || !user.refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }
    const isMatch = await compareData(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new AppError("Invalid refresh token", 401);
    }
    await updateRefreshToken(user.id, null, null);
  } catch {
    return;
  }
};
