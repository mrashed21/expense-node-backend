import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
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
    const goal = await Goal.findOne({ _id: goalId, user_id: userId });
    if (!goal) {
      throw new ApiError(httpStatus.NOT_FOUND, "Goal not found.");
    }

    goal.current_amount += amount;
    const wasCompleted = goal.status !== "completed";
    if (goal.current_amount >= goal.target_amount) {
      goal.status = "completed";
    }
    await goal.save();

    // Fire goal-milestone notification when goal just reached 100%
    if (goal.status === "completed" && wasCompleted) {
      setImmediate(async () => {
        try {
          const { default: app } = await import("../../app.js");
          const io = (app as any).get("io") ?? null;
          await createAndEmitNotification(io, userId, {
            title: "Goal Achieved! 🎉",
            message: `Congratulations! You've reached your goal: "${goal.title}".`,
            type: "goal_milestone",
          });
        } catch (e) {
          console.error("[GoalMilestone] Failed to send notification:", e);
        }
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
