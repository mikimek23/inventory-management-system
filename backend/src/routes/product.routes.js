import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createProductController,
  getProductController,
  getProductsController,
  updateProductController,
  updateProductStatusController,
} from "../controllers/product.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  createProductValidator,
  updateProductValidator,
} from "../validators/product.validator.js";
import { requireRole } from "../middleware/role.middleware.js";

const productRouter = express.Router();
productRouter.get("/", authMiddleware, getProductsController);
productRouter.get("/:id", authMiddleware, getProductController);
productRouter.post(
  "/",

  authMiddleware,
  requireRole("ADMIN"),
  validate(createProductValidator),
  createProductController,
);
productRouter.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateProductValidator),
  updateProductController,
);
productRouter.patch(
  "/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  updateProductStatusController,
);
export default productRouter;
