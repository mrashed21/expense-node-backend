import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import { NetWorthController } from "./net-worth.controller";

const router = Router();

router.get("/current", auth, NetWorthController.getCurrentNetWorth);
router.get("/history", auth, NetWorthController.getNetWorthHistory);

export const netWorthRoutes = router;
