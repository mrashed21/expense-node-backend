import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { UserRole } from "../../modules/user/user.interface";
import { NotificationController } from "./notification.controller";

const router = Router();
router.use(checkAuth(UserRole.USER));

router.get("/", NotificationController.getNotifications);
router.patch("/read-all", NotificationController.markAllAsRead);
router.patch("/:id/read", NotificationController.markAsRead);
router.delete("/:id", NotificationController.deleteNotification);

export const notificationRoutes = router;
