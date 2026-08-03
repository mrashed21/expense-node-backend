import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
import { Goal } from "./goal.model";

export const GoalService = {
  createGoal: async (userId: string, payload: any) => {
    return Goal.create({
      ...payload,
      user_id: userId,
    });
  },

  getGoals: async (userId: string) => {
    const goals = await Goal.find({ user_id: userId }).sort({ createdAt: -1 }).lean();

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
    const goal = await Goal.findOne({ _id: goalId, user_id: userId });
    if (!goal) {
      throw new ApiError(httpStatus.NOT_FOUND, "Goal not found.");
    }

    goal.current_amount += amount;
    if (goal.current_amount >= goal.target_amount) {
      goal.status = "completed";
    }
    await goal.save();

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
