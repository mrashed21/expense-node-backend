import { Router } from "express";
import { ReportController } from "./report.controller";
import { auth } from "@/middlewares/auth.middleware";

const router = Router();

router.get("/balance-sheet", auth, ReportController.getBalanceSheet);
router.get("/cash-flow", auth, ReportController.getCashFlowReport);
router.get("/tax-report", auth, ReportController.getTaxReport);

export const ReportRoutes = router;
