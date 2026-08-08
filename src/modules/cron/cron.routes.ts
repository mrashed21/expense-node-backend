import { Router } from "express";
import { CronController } from "./cron.controller";

const router = Router();

router.get("/reminders", CronController.runReminders);
router.get("/recurring", CronController.runRecurring);

export const cronRoutes = router;
