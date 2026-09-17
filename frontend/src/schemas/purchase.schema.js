import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().uuid("Please select a product"),
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .positive("Quantity must be greater than 0"),
  unitCost: z
    .number({ invalid_type_error: "Unit cost is required" })
    .nonnegative("Unit cost cannot be negative"),
});

export const purchaseSchema = z
  .object({
    supplierId: z.string().uuid("Supplier is required"),
    notes: z
      .string()
      .trim()
      .min(3, "Notes must be at least 3 characters if provided")
      .or(z.literal(""))
      .optional(),
    items: z
      .array(purchaseItemSchema)
      .min(1, "Purchase must contain at least one product item"),
  })
  .superRefine((data, ctx) => {
    const ids = new Set();
    data.items.forEach((item, index) => {
      if (item.productId && ids.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "productId"],
          message: "Duplicate product in purchase items",
        });
      }
      if (item.productId) ids.add(item.productId);
    });
  });
