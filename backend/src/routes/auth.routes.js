import express from "express";
import { validate } from "../middleware/validator.middleware.js";
import {
  userLoginvalidator,
  userRegisterValidator,
} from "../validators/auth.validator.js";
import {
  logOutController,
  profileController,
  refreshTokenController,
  userLoginController,
  userRegisterController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const authRouter = express.Router();
authRouter.post(
  "/register",
  validate(userRegisterValidator),
  userRegisterController,
);
authRouter.post("/login", validate(userLoginvalidator), userLoginController);
authRouter.post("/refresh", refreshTokenController);
authRouter.post("/logout", logOutController);
authRouter.get("/me",authMiddleware,profileController)
export default authRouter;
