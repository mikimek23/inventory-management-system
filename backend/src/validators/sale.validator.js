import { z } from "zod";

const saleItemSchema = z.object({
  productId: z.uuid("Invalid productId"),

  quantity: z.number().positive("Quantity must be greater than 0"),

  unitPrice: z.number().nonnegative("Unit price cannot be negative"),
});

const validateUniqueProducts = (items, ctx) => {
  const productIds = new Set();

  items.forEach((item, index) => {
    if (productIds.has(item.productId)) {
      ctx.addIssue({
        code: "custom",
        path: ["items", index, "productId"],
        message: "Product cannot appear more than once in a sale",
      });
    }

    productIds.add(item.productId);
  });
};

export const createSaleValidator = z
  .object({
    customerId: z.uuid("Invalid customerId").optional(),

    notes: z
      .string()
      .trim()
      .min(3, "Note must be at least 3 characters long")
      .optional(),

    items: z
      .array(saleItemSchema)
      .min(1, "Sale must contain at least one item"),
  })
  .superRefine((data, ctx) => {
    validateUniqueProducts(data.items, ctx);
  })
  .strict();

export const updateSaleValidator = z
  .object({
    customerId: z.uuid("Invalid customerId").optional(),

    notes: z
      .string()
      .trim()
      .min(3, "Note must be at least 3 characters long")
      .optional(),

    items: z
      .array(saleItemSchema)
      .min(1, "Sale must contain at least one item")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.items) {
      validateUniqueProducts(data.items, ctx);
    }
  })
  .strict();
