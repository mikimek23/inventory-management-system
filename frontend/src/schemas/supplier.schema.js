import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^0[79]\d{8}$/, "Phone must start with 07 or 09 and contain 10 digits (e.g. 0712345678)"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .or(z.literal(""))
    .optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const supplierSchema = contactSchema;
