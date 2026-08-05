import { z } from "zod";

export const createBillSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(100),
    type: z.string().optional(),
    amount: z.number().positive("Amount must be greater than 0"),
    due_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    auto_reminder: z.boolean().optional(),
  }),
});

export const payBillSchema = z.object({
  body: z.object({
    account_id: z.string().min(1, "Account ID is required"),
    category_id: z.string().optional(),
  }),
});
