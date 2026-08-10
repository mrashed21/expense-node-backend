import { Router } from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { GoalController } from "./goal.controller";
import { createGoalSchema, depositGoalSchema } from "./goal.validation";

const router = Router();
router.use(checkAuth());

router.post("/", validateRequest(createGoalSchema), GoalController.createGoal);
router.get("/", GoalController.getGoals);
router.patch(
  "/:id/deposit",
  validateRequest(depositGoalSchema),
  GoalController.depositToGoal,
);
router.delete("/:id", GoalController.deleteGoal);

export const goalRoutes = router;
