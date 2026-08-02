import { checkAuth } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { GoalController } from "./goal.controller";

const router = Router();
router.use(checkAuth());

router.post("/", GoalController.createGoal);
router.get("/", GoalController.getGoals);
router.patch("/:id/deposit", GoalController.depositToGoal);
router.delete("/:id", GoalController.deleteGoal);

export const goalRoutes = router;
