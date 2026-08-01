import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { checkAuth } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { updateProfileSchema, changePasswordSchema } from "../validators/auth.validator";

const router = Router();

router.use(checkAuth()); // Require authentication for all user profile routes

router.get("/profile", UserController.getProfile);
router.patch("/profile", validateRequest(updateProfileSchema), UserController.updateProfile);
router.patch("/profile-image", UserController.updateProfileImage);
router.patch("/change-password", validateRequest(changePasswordSchema), UserController.changePassword);
router.get("/login-history", UserController.getLoginHistory);
router.delete("/account", UserController.deleteAccount);

export const userRoutes = router;
