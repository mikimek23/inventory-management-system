import { z } from "zod";

const purchaseItemSchema = z.object({
  productId: z.uuid("Invalid productId"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitCost: z.number().nonnegative("Unit cost cannot be negative"),
});

export const createPurchaseValidator = z
  .object({
    supplierId: z.uuid("Invalid supplierId"),

    notes: z
      .string()
      .trim()
      .min(3, "Note must be at least 3 characters long")
      .optional(),

    items: z
      .array(purchaseItemSchema)
      .min(1, "Purchase must contain at least one item"),
  })
  .strict();

export const updatePurchaseValidator = z
  .object({
    supplierId: z.uuid("Invalid supplierId").optional(),

    notes: z
      .string()
      .trim()
      .min(3, "Note must be at least 3 characters long")
      .optional(),

    items: z
      .array(purchaseItemSchema)
      .min(1, "Purchase must contain at least one item")
      .optional(),
  })
  .strict();
