import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import { ReportController } from "./report.controller";

const router = Router();

router.get("/balance-sheet", auth, ReportController.getBalanceSheet);
router.get("/cash-flow", auth, ReportController.getCashFlowReport);
router.get("/tax-report", auth, ReportController.getTaxReport);

export const ReportRoutes = router;
