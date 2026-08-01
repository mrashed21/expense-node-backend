import { z } from "zod";
import { TransactionType } from "./transaction.interface";

export const transactionSchema = z.object({
  body: z.object({
    account_id: z.string().min(1, "Account ID is required"),
    category_id: z.string().optional(),
    subcategory_id: z.string().optional(),
    type: z.nativeEnum(TransactionType),
    amount: z.number().positive("Amount must be positive"),
    date: z.string().or(z.date()).optional(),
    payment_method: z.string().optional(),
    notes: z.string().optional(),
    location: z.string().optional(),
    reference_number: z.string().optional(),
    tags: z.array(z.string()).optional(),
    is_recurring: z.boolean().optional(),
  }),
});
