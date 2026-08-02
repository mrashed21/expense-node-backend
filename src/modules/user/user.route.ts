import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { updateProfileSchema, changePasswordSchema } from "./user.validation";

import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.use(checkAuth());

router.get("/profile", UserController.getProfile);
router.patch("/profile", validateRequest(updateProfileSchema), UserController.updateProfile);
router.patch("/profile-image", upload.single("user_profile_image"), UserController.updateProfileImage);
router.patch("/change-password", validateRequest(changePasswordSchema), UserController.changePassword);
router.get("/login-history", UserController.getLoginHistory);
router.delete("/account", UserController.deleteAccount);

export const userRoutes = router;
