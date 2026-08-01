import { z } from "zod";
import { AccountType, CategoryType, TransactionType } from "../interfaces/financial.interface";

export const accountSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Account name is required"),
    type: z.nativeEnum(AccountType),
    opening_balance: z.number().default(0),
    color: z.string().optional(),
    icon: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    type: z.nativeEnum(CategoryType),
    parent_id: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
});

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
