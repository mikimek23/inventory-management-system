import { z } from "zod";

export const updateUserValidator = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters long")
      .optional(),
    email: z.string().trim().email("Invalid email").toLowerCase().optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "At least one field is required to update the category",
  });
export const updateUserRoleValidator = z.object({
  role: z.enum(["ADMIN", "STAFF"], "invalid role").optional(),
});
export const updateUserStatusValidator = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"], "invalid role").optional(),
});
