import { z } from "zod";

const base = {
  account_id: z.string().min(1),
  name: z.string().min(1).max(120),
  type: z.enum(["dps", "fdr"]),
  principal_amount: z.number().positive(),
  monthly_installment: z.number().positive().optional(),
  interest_rate: z.number().min(0),
  start_date: z.coerce.date(),
  maturity_date: z.coerce.date(),
  notes: z.string().max(500).optional(),
};

export const createDpsFdrSchema = z.object({ body: z.object(base) });
export const updateDpsFdrSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120).optional(),
    interest_rate: z.number().min(0).optional(),
    maturity_date: z.coerce.date().optional(),
    notes: z.string().max(500).optional(),
  }).strict(),
});
