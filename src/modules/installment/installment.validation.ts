import { Types } from "mongoose";
import { z } from "zod";

const objectIdValidator = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createInstallmentSchema = z.object({
  body: z.object({
    account_id: objectIdValidator,
    title: z
      .string({
        required_error: "Title is required",
      })
      .min(1, "Title cannot be empty"),
    total_amount: z
      .number({
        required_error: "Total amount is required",
      })
      .min(0.01, "Total amount must be greater than zero"),
    total_months: z
      .number({
        required_error: "Total months is required",
      })
      .min(1, "Must have at least 1 month")
      .int("Total months must be an integer"),
    start_date: z
      .string({
        required_error: "Start date is required",
      })
      .datetime(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateInstallmentSchema = z.object({
  body: z.object({
    account_id: objectIdValidator.optional(),
    title: z.string().min(1, "Title cannot be empty").optional(),
    total_amount: z
      .number()
      .min(0.01, "Total amount must be greater than zero")
      .optional(),
    total_months: z
      .number()
      .min(1, "Must have at least 1 month")
      .int()
      .optional(),
    start_date: z.string().datetime().optional(),
    notes: z.string().optional().nullable(),
  }),
});

export const addInstallmentPaymentSchema = z.object({
  body: z.object({
    amount: z
      .number({
        required_error: "Payment amount is required",
      })
      .min(0.01, "Payment amount must be greater than zero"),
    date: z.string().datetime().optional(),
    notes: z.string().optional().nullable(),
  }),
});
