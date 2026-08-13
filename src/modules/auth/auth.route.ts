import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { AuthController } from "./auth.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyLogin2FASchema,
  verifyOtpSchema,
} from "./auth.validation";

import { generateCsrfToken } from "../../middlewares/csrf.middleware";
import { authLimiter } from "../../middlewares/rate-limiter.middleware";

const router = Router();
router.get("/csrf-token", generateCsrfToken, AuthController.getCsrfToken);

router.post(
  "/register",
  authLimiter,
  validateRequest(registerSchema),
  AuthController.register,
);
router.post(
  "/verify-otp",
  authLimiter,
  validateRequest(verifyOtpSchema),
  AuthController.verifyOtp,
);
router.post(
  "/resend-otp",
  authLimiter,
  validateRequest(resendOtpSchema),
  AuthController.resendOtp,
);
router.post("/login", authLimiter, validateRequest(loginSchema), AuthController.login);
router.post(
  "/login/verify",
  authLimiter,
  validateRequest(verifyLogin2FASchema),
  AuthController.verifyLogin2FA,
);
router.get("/me", checkAuth(), AuthController.getMe);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.post("/logout-all", checkAuth(), AuthController.logoutAllDevices);
router.post(
  "/forgot-password",
  authLimiter,
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword,
);

export const authRoutes = router;
