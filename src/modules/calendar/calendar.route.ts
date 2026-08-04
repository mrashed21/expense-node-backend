import { Router } from "express";
import { CalendarController } from "./calendar.controller";
import { auth } from "@/middlewares/auth.middleware";

const router = Router();

router.get("/", auth, CalendarController.getEvents);

export const CalendarRoutes = router;
