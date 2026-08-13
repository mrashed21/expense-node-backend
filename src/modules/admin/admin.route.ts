import { Router } from "express";
import { checkAdminAuth } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { AdminController } from "./admin.controller";
import { AdminRole } from "./admin.interface";
import {
  broadcastNotificationSchema,
  createAdminSchema,
  createUserSchema,
  sendUserNotificationSchema,
  updateAdminStatusSchema,
  updateUserStatusSchema,
} from "./admin.validation";

const router = Router();

router.use(checkAdminAuth(AdminRole.ADMIN, AdminRole.SUPER_ADMIN));

router.patch("/profile", AdminController.updateProfile);
router.patch(
  "/profile-image",
  upload.single("admin_profile_image"),
  AdminController.updateProfileImage,
);
router.get("/search", AdminController.globalSearch);

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
router.post(
  "/users/:id/notify",
  validateRequest(sendUserNotificationSchema),
  AdminController.sendUserNotification,
);

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

router.get("/dashboard-stats", AdminController.getDashboardStats);
router.get("/user-growth", AdminController.getUserGrowth);

router.get("/system-health", AdminController.getSystemHealth);
router.get("/activity", AdminController.getActivity);
router.get("/notifications", AdminController.getNotificationHistory);
router.post("/test-notification", AdminController.testNotification);

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
