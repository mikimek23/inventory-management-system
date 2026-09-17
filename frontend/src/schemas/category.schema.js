import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters long"),
  description: z
    .string()
    .trim()
    .min(3, "Description must be at least 3 characters long")
    .or(z.literal(""))
    .optional(),
});
