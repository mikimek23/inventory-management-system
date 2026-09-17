import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  cancelPurchaseController,
  completePurchaseController,
  createPurchaseController,
  getPurchaseController,
  getPurchasesController,
  updatePurchaseController,
} from "../controllers/purchase.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  createPurchaseValidator,
  updatePurchaseValidator,
} from "../validators/purchase.validator.js";

const purchaseRouter = express.Router();
purchaseRouter.get("/", authMiddleware, getPurchasesController);
purchaseRouter.get("/:id", authMiddleware, getPurchaseController);
purchaseRouter.post(
  "/",
  authMiddleware,
  validate(createPurchaseValidator),
  createPurchaseController,
);
purchaseRouter.patch(
  "/:id",
  authMiddleware,
  validate(updatePurchaseValidator),
  updatePurchaseController,
);
purchaseRouter.patch(
  "/:id/complete",
  authMiddleware,
  completePurchaseController,
);
purchaseRouter.patch("/:id/cancel", authMiddleware, cancelPurchaseController);
export default purchaseRouter;
