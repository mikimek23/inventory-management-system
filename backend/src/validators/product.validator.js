import { z } from "zod";

export const createProductValidator = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),

    categoryId: z.uuid("Invalid category ID"),

    unit: z.string().trim().min(1, "Unit is required"),

    costPrice: z.number().nonnegative("Cost price cannot be negative"),

    sellingPrice: z.number().nonnegative("Selling price cannot be negative"),

    minimumStock: z.number().nonnegative("Minimum stock cannot be negative"),

    quantity: z.number().nonnegative("Opening quantity cannot be negative"),
  })
  .strict()
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price cannot be lower than cost price",
    path: ["sellingPrice"],
  });

export const updateProductValidator = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .optional(),

    categoryId: z.uuid("Invalid category ID").optional(),

    unit: z.string().trim().min(1, "Unit is required").optional(),

    costPrice: z
      .number()
      .nonnegative("Cost price cannot be negative")
      .optional(),

    sellingPrice: z
      .number()
      .nonnegative("Selling price cannot be negative")
      .optional(),

    minimumStock: z
      .number()
      .nonnegative("Minimum stock cannot be negative")
      .optional(),
  })
  .strict();
