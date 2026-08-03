import { z } from "zod";

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(100),
    category: z.string().optional(),
    target_amount: z.number().positive("Target amount must be greater than 0"),
    current_amount: z.number().nonnegative().optional(),
    target_date: z.string().optional(),
    status: z.enum(["active", "completed", "paused"]).optional(),
  }),
});

export const depositGoalSchema = z.object({
  body: z.object({
    amount: z.number().positive("Deposit amount must be greater than 0"),
  }),
});
