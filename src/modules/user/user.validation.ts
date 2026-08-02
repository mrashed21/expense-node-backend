import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    user_name: z.string().min(2).optional(),
    user_phone: z.string().optional(),
    user_area: z.string().optional(),
    user_city: z.string().optional(),
    user_country: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
    date_format: z.string().optional(),
    number_format: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});
