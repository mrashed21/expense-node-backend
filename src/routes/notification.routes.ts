import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { checkAuth } from "../middlewares/auth.middleware";

const router = Router();
router.use(checkAuth());

router.get("/", NotificationController.getNotifications);
router.patch("/:id/read", NotificationController.markAsRead);
router.patch("/read-all", NotificationController.markAllAsRead);

export const notificationRoutes = router;
