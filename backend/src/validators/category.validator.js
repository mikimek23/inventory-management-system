import { z } from "zod";

export const createCategoryValidator = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters long"),
    description: z
      .string()
      .trim()
      .min(3, "Description must be at least 3 characters long")
      .optional(),
  })
  .strict();

export const updateCategoryValidator = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters long")
      .optional(),

    description: z
      .string()
      .trim()
      .min(3, "Description must be at least 3 characters long")
      .optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field is required to update the category",
  });
