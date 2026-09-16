import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  createCategoryController,
  getCategoriesController,
  getCategoryController,
  updateCategoryController,
  updateCategoryStatusController,
} from "../controllers/category.controller.js";

import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validator.js";
import { validate } from "../middleware/validator.middleware.js";
const categoryRouter = express.Router();
categoryRouter.get("/", authMiddleware, getCategoriesController);
categoryRouter.get("/:id", authMiddleware, getCategoryController);
categoryRouter.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createCategoryValidator),
  createCategoryController,
);
categoryRouter.patch(
  "/:id",

  authMiddleware,
  requireRole("ADMIN"),
  validate(updateCategoryValidator),
  updateCategoryController,
);
categoryRouter.post(
  "/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  updateCategoryStatusController,
);
export default categoryRouter;
