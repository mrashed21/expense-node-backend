import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAuth } from "../../middlewares/auth.middleware";
import { UserRole } from "../user/user.interface";

const router = Router();

// Apply auth middleware requiring ADMIN role
router.use(checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get("/users", AdminController.getUsers);
router.post("/users", AdminController.createUser);
router.put("/users/:id", AdminController.updateUser);
router.delete("/users/:id", AdminController.deleteUser);
router.patch("/users/:id/status", AdminController.updateUserStatus);

router.get("/system-health", AdminController.getSystemHealth);
router.get("/activity", AdminController.getActivity);
router.post("/test-notification", AdminController.testNotification);

export const adminRoutes = router;
