import express from "express";
import {
  getUserController,
  getUsersController,
  updateUserRoleController,
  updateUserStatusController,
} from "../controllers/user.controller.js";
import { requireRole } from "../middleware/role.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  updateUserRoleValidator,
  updateUserStatusValidator,
} from "../validators/userupdate.validator.js";

const userRouter = express.Router();
userRouter.get("/", authMiddleware, requireRole("ADMIN"), getUsersController);
userRouter.get("/:id", authMiddleware, requireRole("ADMIN"), getUserController);
userRouter.patch(
  "/:id/role",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateUserRoleValidator),
  updateUserRoleController,
);
userRouter.patch(
  "/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateUserStatusValidator),
  updateUserStatusController,
);
export default userRouter;
