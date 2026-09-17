import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  cancelSaleController,
  completeSaleController,
  createSaleController,
  getSaleController,
  getSalesController,
} from "../controllers/sale.controller.js";
import { createSaleValidator } from "../validators/sale.validator.js";

const saleRouter = express.Router();
saleRouter.get("/", authMiddleware, getSalesController);
saleRouter.get("/:id", authMiddleware, getSaleController);
saleRouter.post("/", authMiddleware, validate(createSaleValidator), createSaleController);
saleRouter.patch("/:id/complete", authMiddleware, completeSaleController);
saleRouter.patch("/:id/cancel", authMiddleware, cancelSaleController);

export default saleRouter;
