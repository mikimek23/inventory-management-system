import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
const env = getEnv();
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.accessTokenSecret, {
    expiresIn: env.accessTokenExpiredIn,
  });
};
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiredIn,
  });
};
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.accessTokenSecret);
};
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.refreshTokenSecret);
};
