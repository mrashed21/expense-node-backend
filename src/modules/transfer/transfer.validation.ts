import { z } from "zod";

export const transferSchema = z.object({
  body: z.object({
    from_account_id: z.string().min(1, "Source account required"),
    to_account_id: z.string().min(1, "Destination account required"),
    amount: z.number().positive("Amount must be positive"),
    fee: z.number().min(0).optional(),
    date: z.string().or(z.date()).optional(),
    notes: z.string().optional(),
  }),
});
