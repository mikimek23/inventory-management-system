import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createCustomerController,
  getCustomersController,
  updateCustomerController,
  updateCustomerStatusController,
} from "../controllers/customer.controller.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  createContactValidator,
  updateContactValidator,
} from "../validators/contact.validator.js";
const customerRouter = express.Router();

customerRouter.get("/", authMiddleware, getCustomersController);
customerRouter.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createContactValidator),
  createCustomerController,
);
customerRouter.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateContactValidator),
  updateCustomerController,
);
customerRouter.patch(
  "/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  updateCustomerStatusController,
);
export default  customerRouter