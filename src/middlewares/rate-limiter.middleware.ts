import rateLimit from "express-rate-limit";

// Limit for sensitive auth routes (login, register, otp, csrf)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Temporarily increased for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many attempts from this IP. Please try again after 15 minutes.",
  },
});

// Stricter limit for password reset routes (forgot-password, reset-password)
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000, // Temporarily increased for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password reset attempts. Please try again after 15 minutes.",
  },
});

// Limit for general API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30000, // Temporarily increased for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
