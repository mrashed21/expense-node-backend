import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import { CalendarController } from "./calendar.controller";

const router = Router();

router.get("/", auth, CalendarController.getEvents);

export const CalendarRoutes = router;
