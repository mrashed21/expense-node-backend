import { Router } from "express";
import { AdminController } from "./admin.controller";
import { checkAdminAuth } from "../../middlewares/auth.middleware";
import { AdminRole } from "./admin.interface";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { updateAdminStatusSchema, updateUserStatusSchema } from "./admin.validation";

const router = Router();

// Apply auth middleware requiring ADMIN or SUPER_ADMIN
router.use(checkAdminAuth(AdminRole.ADMIN, AdminRole.SUPER_ADMIN));

// User Management
router.get("/users", AdminController.getUsers);
router.post("/users", AdminController.createUser);
router.put("/users/:id", AdminController.updateUser);
router.delete("/users/:id", AdminController.deleteUser);
router.patch("/users/:id/status", validateRequest(updateUserStatusSchema), AdminController.updateUserStatus);

// Admin Management (Only SUPER_ADMIN)
router.get("/admins", checkAdminAuth(AdminRole.SUPER_ADMIN), AdminController.getAdmins);
router.post("/admins", checkAdminAuth(AdminRole.SUPER_ADMIN), AdminController.createAdmin);
router.patch("/admins/:id/status", checkAdminAuth(AdminRole.SUPER_ADMIN), validateRequest(updateAdminStatusSchema), AdminController.updateAdminStatus);

// System
router.get("/system-health", AdminController.getSystemHealth);
router.get("/activity", AdminController.getActivity);
router.post("/test-notification", AdminController.testNotification);

export const adminRoutes = router;
