import { checkAuth } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { BudgetController } from "./budget.controller";

const router = Router();
router.use(checkAuth());

router.post("/", BudgetController.createBudget);
router.get("/", BudgetController.getBudgets);
router.delete("/:id", BudgetController.deleteBudget);

export const budgetRoutes = router;
