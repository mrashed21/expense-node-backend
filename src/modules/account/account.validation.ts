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
