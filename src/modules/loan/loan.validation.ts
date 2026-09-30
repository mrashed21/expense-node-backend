import { z } from "zod";

export const createLoanSchema = z.object({
  body: z.object({
    borrower_name: z
      .string({
        required_error: "Borrower name is required",
      })
      .min(1, "Borrower name cannot be empty"),
    borrower_id: z.string().optional(),
    principal_amount: z.coerce
      .number({
        required_error: "Principal amount is required",
      })
      .positive("Principal amount must be greater than zero"),
    source_account_id: z
      .string({
        required_error: "Source account is required",
      })
      .min(1, "Source account is required"),
    lent_date: z.string().optional().or(z.date().optional()),
    expected_return_date: z.string().optional().nullable(),
    notes: z.string().optional(),
  }),
});

export const updateLoanSchema = z.object({
  body: z.object({
    expected_return_date: z.string().optional().nullable(),
    notes: z.string().optional(),
  }),
});

export const cancelLoanSchema = z.object({
  body: z
    .object({
      reason: z.string().optional(),
    })
    .optional(),
});

export const writeOffLoanSchema = z.object({
  body: z
    .object({
      reason: z.string().optional(),
    })
    .optional(),
});

export const createRepaymentSchema = z.object({
  body: z.object({
    amount: z.coerce
      .number({
        required_error: "Repayment amount is required",
      })
      .positive("Repayment amount must be greater than zero"),
    account_id: z
      .string({
        required_error: "Receiving account is required",
      })
      .min(1, "Receiving account is required"),
    payment_method: z.string().optional().default("Cash"),
    payment_date: z.string().optional().or(z.date().optional()),
    notes: z.string().optional(),
  }),
});

export const createBorrowerSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Borrower name is required",
      })
      .min(1, "Borrower name cannot be empty"),
    phone: z.string().optional(),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    address: z.string().optional(),
    note: z.string().optional(),
  }),
});

export const updateBorrowerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    address: z.string().optional(),
    note: z.string().optional(),
  }),
});
