import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    user_name: z.string().min(2, "Name must be at least 2 characters").max(100),
    user_email: z.string().email("Invalid email address"),
    user_password: z.string().min(8, "Password must be at least 8 characters"),
    user_phone: z.string().optional(),
    user_area: z.string().optional(),
    user_city: z.string().optional(),
    user_country: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    user_email: z.string().email("Invalid email address"),
    user_password: z.string().min(1, "Password is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    user_email: z.string().email("Invalid email address"),
    otp_code: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    user_email: z.string().email("Invalid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    user_email: z.string().email("Invalid email address"),
    otp_code: z.string().length(6, "OTP must be 6 digits"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
  }),
});

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
    new_password: z.string().min(8, "New password must be at least 8 characters"),
  }),
});
