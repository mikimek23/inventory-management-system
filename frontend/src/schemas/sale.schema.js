import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().uuid("Please select a product"),
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .positive("Quantity must be greater than 0"),
  unitPrice: z
    .number({ invalid_type_error: "Unit price is required" })
    .nonnegative("Unit price cannot be negative"),
});

export const saleSchema = z
  .object({
    customerId: z.string().uuid("Please select a valid customer").or(z.literal("")).optional(),
    notes: z
      .string()
      .trim()
      .min(3, "Notes must be at least 3 characters if provided")
      .or(z.literal(""))
      .optional(),
    items: z
      .array(saleItemSchema)
      .min(1, "Sale must contain at least one product item"),
  })
  .superRefine((data, ctx) => {
    const ids = new Set();
    data.items.forEach((item, index) => {
      if (item.productId && ids.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "productId"],
          message: "Duplicate product in sale items",
        });
      }
      if (item.productId) ids.add(item.productId);
    });
  });
