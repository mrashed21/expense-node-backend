import { Router } from "express";
import { AdminAuthController } from "./admin-auth.controller";
import { checkAdminAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { adminLoginSchema } from "./admin.validation";

const router = Router();

router.post("/login", validateRequest(adminLoginSchema), AdminAuthController.login);
router.post("/refresh-token", AdminAuthController.refreshToken);

// Routes requiring authentication
router.use(checkAdminAuth());
router.get("/me", AdminAuthController.getMe);
router.post("/logout", AdminAuthController.logout);
router.post("/logout-all", AdminAuthController.logoutAllDevices);

export const adminAuthRoutes = router;
