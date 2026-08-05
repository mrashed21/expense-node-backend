import { z } from "zod";
import { DebtType } from "./debt.interface";

export const createDebtSchema = z.object({
  body: z.object({
    person_name: z
      .string({
        required_error: "Person name is required",
      })
      .min(1, "Person name cannot be empty"),
    type: z.nativeEnum(DebtType, {
      required_error: "Debt type is required",
      invalid_type_error: "Invalid debt type",
    }),
    amount: z
      .number({
        required_error: "Amount is required",
      })
      .min(0.01, "Amount must be greater than zero"),
    interest_rate: z
      .number()
      .min(0, "Interest rate cannot be negative")
      .optional()
      .nullable(),
    due_date: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateDebtSchema = z.object({
  body: z.object({
    person_name: z.string().min(1, "Person name cannot be empty").optional(),
    type: z.nativeEnum(DebtType).optional(),
    amount: z.number().min(0.01, "Amount must be greater than zero").optional(),
    interest_rate: z
      .number()
      .min(0, "Interest rate cannot be negative")
      .optional()
      .nullable(),
    due_date: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const addPaymentSchema = z.object({
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
