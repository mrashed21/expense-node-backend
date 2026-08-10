import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { BudgetController } from "./budget.controller";
import { createBudgetSchema } from "./budget.validation";

const router = Router();
router.use(checkAuth());

router.post(
  "/",
  validateRequest(createBudgetSchema),
  BudgetController.createBudget,
);
router.get("/", BudgetController.getBudgets);
router.delete("/:id", BudgetController.deleteBudget);

export const budgetRoutes = router;
