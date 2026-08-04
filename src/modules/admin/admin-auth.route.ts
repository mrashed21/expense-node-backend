import { Router } from "express";
import { AdminAuthController } from "./admin-auth.controller";
import { adminLoginSchema } from "./admin.validation";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import { checkAdminAuth } from "@/middlewares/auth.middleware";
import { authLimiter } from "@/middlewares/rate-limiter.middleware";

const router = Router();

router.post(
  "/login",
  authLimiter,
  validateRequest(adminLoginSchema),
  AdminAuthController.login,
);
router.post("/refresh-token", authLimiter, AdminAuthController.refreshToken);

// Routes requiring authentication
router.use(checkAdminAuth());
router.get("/me", AdminAuthController.getMe);
router.post("/logout", AdminAuthController.logout);
router.post("/logout-all", AdminAuthController.logoutAllDevices);

export const adminAuthRoutes = router;
