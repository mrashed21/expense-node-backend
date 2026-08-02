import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middlewares/auth.middleware";
import { UserRole } from "../user/user.interface";

const router = Router();

// Apply auth middleware requiring ADMIN role
router.use(checkAuth(UserRole.ADMIN));

router.get("/users", AdminController.getUsers);
router.get("/system-health", AdminController.getSystemHealth);
router.get("/activity", AdminController.getActivity);

export const adminRoutes = router;
