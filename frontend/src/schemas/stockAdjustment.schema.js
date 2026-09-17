import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid("Please select a valid product"),
  type: z.enum(["INCREASE", "DECREASE"], {
    errorMap: () => ({ message: "Type must be either INCREASE or DECREASE" }),
  }),
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .positive("Quantity must be greater than 0"),
  reason: z.string().trim().min(1, "Reason is required for every stock adjustment"),
});
