import { auth } from "../../middlewares/auth.middleware";
import { Router } from "express";
import { CalendarController } from "./calendar.controller";

const router = Router();

router.get("/", auth, CalendarController.getEvents);

export const CalendarRoutes = router;
