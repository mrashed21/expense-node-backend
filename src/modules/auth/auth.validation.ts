import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

export const registerSchema = z.object({
  body: z.object({
    user_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .regex(
        /^[a-zA-Z\s.'-]+$/,
        "Name can only contain letters, spaces, dots, hyphens, and apostrophes",
      ),
    user_email: z.string().email("Invalid email address").toLowerCase().trim(),
    user_password: passwordSchema,
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
    otp_code: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only digits"),
  }),
});

export const verifyLogin2FASchema = z.object({
  body: z.object({
    tempToken: z.string().min(1, "Temporary token is required"),
    code: z
      .string()
      .min(6, "Code must be at least 6 characters")
      .max(20, "Code must not exceed 20 characters"),
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
    otp_code: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only digits"),
    new_password: passwordSchema,
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    user_email: z.string().email("Invalid email address"),
  }),
});
