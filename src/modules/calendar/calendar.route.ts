import { Router } from "express";
import { CalendarController } from "./calendar.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/events", CalendarController.getEvents);

export const CalendarRoutes = router;
