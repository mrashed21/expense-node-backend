import { z } from "zod";
import { AccountType } from "./account.interface";

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

export const updateAccountSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Account name is required").optional(),
      type: z.nativeEnum(AccountType).optional(),
      opening_balance: z.number().optional(),
      current_balance: z.number().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
    })
    .strict(),
});
