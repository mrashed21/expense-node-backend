import httpStatus from "http-status";
import ApiError from "../../helpers/api-error";
import { createAndEmitNotification } from "../notification/notification.helper";
import { Goal } from "./goal.model";

export const GoalService = {
  createGoal: async (userId: string, payload: any) => {
    return Goal.create({
      ...payload,
      user_id: userId,
    });
  },

  getGoals: async (userId: string) => {
    const goals = await Goal.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .lean();

    return goals.map((g) => {
      const percentage = Math.min(
        100,
        Math.round((g.current_amount / g.target_amount) * 100),
      );
      return {
        ...g,
        percentage,
      };
    });
  },

  depositToGoal: async (userId: string, goalId: string, amount: number) => {
    let goal = await Goal.findOneAndUpdate(
      { _id: goalId, user_id: userId },
      { $inc: { current_amount: amount } },
      { new: true },
    );

    if (!goal) {
      throw new ApiError(httpStatus.NOT_FOUND, "Goal not found.");
    }

    const wasCompleted = goal.status === "completed";
    let newlyCompleted = false;

    if (goal.current_amount >= goal.target_amount && !wasCompleted) {
      goal.status = "completed";
      await goal.save();
      newlyCompleted = true;
    }

    if (newlyCompleted) {
      await createAndEmitNotification(userId, {
        title: "Goal Achieved! 🎉",
        message: `Congratulations! You've reached your goal: "${goal.title}".`,
        type: "goal_milestone",
        category: "goal",
      });
    }

    return goal;
  },

  deleteGoal: async (userId: string, goalId: string) => {
    const goal = await Goal.findOneAndDelete({ _id: goalId, user_id: userId });
    if (!goal) {
      throw new ApiError(httpStatus.NOT_FOUND, "Goal not found.");
    }
    return true;
  },
};
