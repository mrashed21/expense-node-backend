import { z } from "zod";
import { InvestmentType } from "./investment.interface";

export const createInvestmentSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Investment name is required",
    }).min(1, "Investment name cannot be empty"),
    symbol: z.string().optional().nullable(),
    type: z.nativeEnum(InvestmentType, {
      required_error: "Investment type is required",
      invalid_type_error: "Invalid investment type",
    }),
    quantity: z.number({
      required_error: "Quantity is required",
    }).min(0, "Quantity cannot be negative"),
    purchase_price: z.number({
      required_error: "Purchase price is required",
    }).min(0, "Purchase price cannot be negative"),
    current_price: z.number({
      required_error: "Current price is required",
    }).min(0, "Current price cannot be negative"),
    purchase_date: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateInvestmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Investment name cannot be empty").optional(),
    symbol: z.string().optional().nullable(),
    type: z.nativeEnum(InvestmentType, {
      invalid_type_error: "Invalid investment type",
    }).optional(),
    quantity: z.number().min(0, "Quantity cannot be negative").optional(),
    purchase_price: z.number().min(0, "Purchase price cannot be negative").optional(),
    current_price: z.number().min(0, "Current price cannot be negative").optional(),
    purchase_date: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});
