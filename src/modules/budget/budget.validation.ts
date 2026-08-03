import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    category_id: z.string().min(1, "Category is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    period: z.enum(["monthly", "yearly"]).optional(),
    month_year: z.string().regex(/^\d{4}-\d{2}$/, "Invalid month format (YYYY-MM)").optional(),
    warning_threshold: z.enum([50, 75, 80, 90, 100] as const).optional(),
  }),
});
