import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    category_id: z.string().min(1, "Category is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    period: z.enum(["monthly", "yearly"]).optional(),
    month_year: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Invalid month format (YYYY-MM)")
      .optional(),
    warning_threshold: z
      .union([
        z.literal(50),
        z.literal(75),
        z.literal(80),
        z.literal(90),
        z.literal(100),
      ])
      .optional(),
  }),
});
