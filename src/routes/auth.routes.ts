import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { checkAuth } from "../middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", validateRequest(registerSchema), AuthController.register);
router.post("/verify-otp", validateRequest(verifyOtpSchema), AuthController.verifyOtp);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.post("/logout-all", checkAuth(), AuthController.logoutAllDevices);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), AuthController.resetPassword);

export const authRoutes = router;
