import { ZodError } from "zod";
import AppError from "../utils/AppError.js";
export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(result.error.issues[0].message, 400));
    }
    req.body = result.data;
    next()
  } catch (err) {
    next(err);
  }
};
