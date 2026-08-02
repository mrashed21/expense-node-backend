import { checkAuth } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { NotificationController } from "./notification.controller";

const router = Router();
router.use(checkAuth());

router.get("/", NotificationController.getNotifications);
router.patch("/:id/read", NotificationController.markAsRead);
router.patch("/read-all", NotificationController.markAllAsRead);

export const notificationRoutes = router;
