import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { updateProfileController } from "../controllers/profile.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import { updateUserValidator } from "../validators/userupdate.validator.js";
const profileRouter = express.Router();
profileRouter.patch("/",validate(updateUserValidator), authMiddleware, updateProfileController);
export default profileRouter;
