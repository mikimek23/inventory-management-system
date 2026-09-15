import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/token.js";
import jwt from 'jsonwebtoken'
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError("Access token is required", 401);
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError("Invalid token format", 401);
    }
    const token = authHeader.split(" ")[1];
        if (!token) {
      throw new AppError("Access token is required", 401);
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401))
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next( new AppError('Invalid token', 401))
    }

    next(error)
  }
};
