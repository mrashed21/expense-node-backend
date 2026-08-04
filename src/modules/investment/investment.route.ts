import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate-request";
import { InvestmentController } from "./investment.controller";
import { createInvestmentSchema, updateInvestmentSchema } from "./investment.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(createInvestmentSchema),
  InvestmentController.createInvestment
);

router.get("/", auth, InvestmentController.getInvestments);

router.get("/:id", auth, InvestmentController.getInvestmentById);

router.patch(
  "/:id",
  auth,
  validateRequest(updateInvestmentSchema),
  InvestmentController.updateInvestment
);

router.delete("/:id", auth, InvestmentController.deleteInvestment);

router.patch("/:id/restore", auth, InvestmentController.restoreInvestment);

export const InvestmentRoutes = router;
