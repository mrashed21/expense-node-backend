import { checkAuth } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import { Router } from "express";
import { AuthController } from "./auth.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./auth.validation";

import { generateCsrfToken } from "@/middlewares/csrf.middleware";
import { authLimiter } from "@/middlewares/rate-limiter.middleware";

const router = Router();

router.use(authLimiter);
router.get("/csrf-token", generateCsrfToken, AuthController.getCsrfToken);

router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register,
);
router.post(
  "/verify-otp",
  validateRequest(verifyOtpSchema),
  AuthController.verifyOtp,
);
router.post(
  "/resend-otp",
  validateRequest(resendOtpSchema),
  AuthController.resendOtp,
);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.get("/me", checkAuth(), AuthController.getMe);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.post("/logout-all", checkAuth(), AuthController.logoutAllDevices);
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword,
);

export const authRoutes = router;
