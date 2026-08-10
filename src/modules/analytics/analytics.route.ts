import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { UserRole } from "../../modules/user/user.interface";
import { AnalyticsController } from "./analytics.controller";

const router = Router();
router.use(checkAuth(UserRole.USER));

router.get("/summary", AnalyticsController.getSummary);

export const analyticsRoutes = router;
