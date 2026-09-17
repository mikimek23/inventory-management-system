import { z } from "zod";

export const createContactValidator = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),

    phone: z
      .string()
      .trim()
      .regex(
        /^0[79]\d{8}$/,
        "Phone must start with 09 or 07 and contain exactly 10 digits",
      ),

    email: z.string().trim().email("Invalid email address").optional(),

    address: z.string().trim().optional(),

    notes: z.string().trim().optional(),
  })
  .strict();

export const updateContactValidator = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .optional(),

    phone: z
      .string()
      .trim()
      .regex(
        /^0[79]\d{8}$/,
        "Phone must start with 09 or 07 and contain exactly 10 digits",
      )
      .optional(),

    email: z.string().trim().email("Invalid email address").optional(),

    address: z.string().trim().optional(),

    notes: z.string().trim().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
