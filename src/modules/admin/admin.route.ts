import { checkAdminAuth } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import { Router } from "express";
import { AdminController } from "./admin.controller";
import { AdminRole } from "./admin.interface";
import {
  broadcastNotificationSchema,
  createAdminSchema,
  createUserSchema,
  updateAdminStatusSchema,
  updateUserStatusSchema,
} from "./admin.validation";

const router = Router();

// Apply auth middleware requiring ADMIN or SUPER_ADMIN
router.use(checkAdminAuth(AdminRole.ADMIN, AdminRole.SUPER_ADMIN));

// Profile & Search
router.patch("/profile", AdminController.updateProfile);
router.patch(
  "/profile-image",
  upload.single("admin_profile_image"),
  AdminController.updateProfileImage,
);
router.get("/search", AdminController.globalSearch);

// User Management
router.get("/users", AdminController.getUsers);
router.post(
  "/users",
  validateRequest(createUserSchema),
  AdminController.createUser,
);
router.put("/users/:id", AdminController.updateUser);
router.delete("/users/:id", AdminController.deleteUser);
router.patch(
  "/users/:id/status",
  validateRequest(updateUserStatusSchema),
  AdminController.updateUserStatus,
);

// Admin Management (Only SUPER_ADMIN)
router.get(
  "/admins",
  checkAdminAuth(AdminRole.SUPER_ADMIN),
  AdminController.getAdmins,
);
router.post(
  "/admins",
  checkAdminAuth(AdminRole.SUPER_ADMIN),
  validateRequest(createAdminSchema),
  AdminController.createAdmin,
);
router.patch(
  "/admins/:id/status",
  checkAdminAuth(AdminRole.SUPER_ADMIN),
  validateRequest(updateAdminStatusSchema),
  AdminController.updateAdminStatus,
);

// System
router.get("/dashboard-stats", AdminController.getDashboardStats);
router.get("/user-growth", AdminController.getUserGrowth);

router.get("/system-health", AdminController.getSystemHealth);
router.get("/activity", AdminController.getActivity);
router.get("/notifications", AdminController.getNotificationHistory);
router.post("/test-notification", AdminController.testNotification);

// Logs (Only SUPER_ADMIN)
router.get(
  "/error-logs",
  checkAdminAuth(AdminRole.SUPER_ADMIN),
  AdminController.getErrorLogs,
);
router.get(
  "/audit-logs",
  checkAdminAuth(AdminRole.SUPER_ADMIN),
  AdminController.getAuditLogs,
);

// Broadcast (Only SUPER_ADMIN)
router.post(
  "/broadcast",
  checkAdminAuth(AdminRole.SUPER_ADMIN),
  validateRequest(broadcastNotificationSchema),
  AdminController.broadcastNotification,
);

// Global Categories
router.post("/categories", AdminController.createGlobalCategory);
router.patch("/categories/:id", AdminController.updateGlobalCategory);
router.delete("/categories/:id", AdminController.deleteGlobalCategory);

export const adminRoutes = router;
