import { Router } from "express";
import { BudgetController } from "../controllers/budget.controller";
import { checkAuth } from "../middlewares/auth.middleware";

const router = Router();
router.use(checkAuth());

router.post("/", BudgetController.createBudget);
router.get("/", BudgetController.getBudgets);
router.delete("/:id", BudgetController.deleteBudget);

export const budgetRoutes = router;
