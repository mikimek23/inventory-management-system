import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  createContactValidator,
  updateContactValidator,
} from "../validators/contact.validator.js";
import {
  createSupplierController,
  getSuppliersController,
  updateSupplierController,
  updateSupplierStatusController,
} from "../controllers/supplier.controller.js";
const supplierRouter = express.Router();

supplierRouter.get("/", authMiddleware, getSuppliersController);
supplierRouter.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createContactValidator),
  createSupplierController,
);
supplierRouter.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateContactValidator),
  updateSupplierController,
);
supplierRouter.patch(
  "/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  updateSupplierStatusController,
);
export default supplierRouter