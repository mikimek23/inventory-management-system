import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  createStockAdjustmentController,
  getStockAdjustmentsController,
  getStockListController,
} from "../controllers/stock.controller.js";
import { createStockAdjustmentValidator } from "../validators/stock.validator.js";

const stockRouter = express.Router();
const stockAdjustmentRouter = express.Router();

stockRouter.get("/", authMiddleware, getStockListController);

stockAdjustmentRouter.get(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  getStockAdjustmentsController,
);
stockAdjustmentRouter.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createStockAdjustmentValidator),
  createStockAdjustmentController,
);

export { stockAdjustmentRouter };
export default stockRouter;
