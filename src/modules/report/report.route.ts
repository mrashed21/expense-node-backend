import { Router } from "express";
import { ReportController } from "./report.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/balance-sheet", ReportController.getBalanceSheet);
router.get("/cash-flow", ReportController.getCashFlowReport);
router.get("/tax", ReportController.getTaxReport);

export const ReportRoutes = router;
