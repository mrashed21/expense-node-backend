import { checkAuth } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import { Router } from "express";
import { UserController } from "./user.controller";
import { changePasswordSchema, updateProfileSchema } from "./user.validation";

import { upload } from "@/middlewares/upload.middleware";

const router = Router();

router.use(checkAuth());

router.get("/profile", UserController.getProfile);
router.patch(
  "/profile",
  validateRequest(updateProfileSchema),
  UserController.updateProfile,
);
router.patch(
  "/profile-image",
  upload.single("user_profile_image"),
  UserController.updateProfileImage,
);
router.patch(
  "/change-password",
  validateRequest(changePasswordSchema),
  UserController.changePassword,
);
router.get("/login-history", UserController.getLoginHistory);
router.delete("/account", UserController.deleteAccount);

// 2FA Routes
router.post("/2fa/generate", UserController.generate2FA);
router.post("/2fa/verify", UserController.verify2FA);
router.post("/2fa/disable", UserController.disable2FA);

// Device Management
router.get("/devices", UserController.getDevices);
router.delete("/devices/:id", UserController.revokeDevice);

export const userRoutes = router;
