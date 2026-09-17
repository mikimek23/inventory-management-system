import { z } from "zod";

export const createStockAdjustmentValidator = z
  .object({
    productId: z.uuid("Invalid productId"),
    type: z.enum(["INCREASE", "DECREASE"]),
    quantity: z.number().positive("Quantity must be greater than 0"),
    reason: z.string().trim().min(1, "Reason is required"),
  })
  .strict();
