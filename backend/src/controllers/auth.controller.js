import { success } from "zod";
import { getEnv } from "../config/env.js";
import {
  logOutService,
  profileService,
  refreshTokenService,
  userLoginService,
  userRegisterService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const env = getEnv();
export const userRegisterController = asyncHandler(async (req, res) => {
  const user = await userRegisterService(req.body);
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});
export const userLoginController = asyncHandler(async (req, res) => {
  const response = await userLoginService(req.body);
  const { refreshToken, ...userData } = response;
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api",
  });
  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: userData,
  });
});
export const refreshTokenController = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  const response = await refreshTokenService(token);
  const { refreshToken, ...userData } = response;
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api",
  });
  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: userData,
  });
});
export const logOutController = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  await logOutService(token);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api",
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
export const profileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const response = await profileService(req.user.id);
  res.status(200).json({
    success: true,
    data: response,
  });
});
