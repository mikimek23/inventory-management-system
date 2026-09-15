import { z } from "zod";
export const userRegisterValidator = z.object({
  name: z.string().trim().min(3,'Name must be at least 3 characters long'),
  email: z.string().trim().email("Invalid email").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase")
    .regex(/\d/, "Password must contain number")
    .regex(/[@$!%*?&]/, "Password must contain special character"),
});
export const userLoginvalidator = z.object({
  email: z.string().trim().email('Invalid email').toLowerCase(),
  password: z.string().min(8,"Password must be at least 8 characters long"),
})