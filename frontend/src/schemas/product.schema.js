import { z } from "zod";

export const createProductSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    categoryId: z.string().uuid("Please select a valid category"),
    unit: z.string().trim().min(1, "Unit is required (e.g. pcs, kg, box)"),
    costPrice: z
      .number({ invalid_type_error: "Cost price is required" })
      .nonnegative("Cost price cannot be negative"),
    sellingPrice: z
      .number({ invalid_type_error: "Selling price is required" })
      .nonnegative("Selling price cannot be negative"),
    minimumStock: z
      .number({ invalid_type_error: "Minimum stock is required" })
      .nonnegative("Minimum stock cannot be negative"),
    quantity: z
      .number({ invalid_type_error: "Opening quantity is required" })
      .nonnegative("Opening quantity cannot be negative")
      .default(0),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price cannot be lower than cost price",
    path: ["sellingPrice"],
  });

export const updateProductSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  categoryId: z.string().uuid("Please select a valid category").optional(),
  unit: z.string().trim().min(1, "Unit is required").optional(),
  costPrice: z
    .number({ invalid_type_error: "Cost price must be a number" })
    .nonnegative("Cost price cannot be negative")
    .optional(),
  sellingPrice: z
    .number({ invalid_type_error: "Selling price must be a number" })
    .nonnegative("Selling price cannot be negative")
    .optional(),
  minimumStock: z
    .number({ invalid_type_error: "Minimum stock must be a number" })
    .nonnegative("Minimum stock cannot be negative")
    .optional(),
});
