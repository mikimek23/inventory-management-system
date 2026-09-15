import express from "express";
import { validate } from "../middleware/validator.middleware.js";
import {
  userLoginvalidator,
  userRegisterValidator,
} from "../validators/auth.validator.js";
import {
  logOutController,
  refreshTokenController,
  userLoginController,
  userRegisterController,
} from "../controllers/auth.controller.js";
const userRouter = express.Router();
userRouter.post(
  "/register",
  validate(userRegisterValidator),
  userRegisterController,
);
userRouter.post("/login", validate(userLoginvalidator), userLoginController);
userRouter.post("/refresh", refreshTokenController);
userRouter.post("/logout", logOutController);
export default userRouter;
