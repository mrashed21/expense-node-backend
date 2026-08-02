import { sendResponse } from "@/helpers/send-response";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { GoalService } from "./goal.service";

export const GoalController = {
  createGoal: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const goal = await GoalService.createGoal(req.user!._id, req.body);
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Savings goal created.",
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  getGoals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const goals = await GoalService.getGoals(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: goals,
      });
    } catch (error) {
      next(error);
    }
  },

  depositToGoal: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount } = req.body;
      const goal = await GoalService.depositToGoal(
        req.user!._id,
        req.params.id as string,
        amount,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Deposit added to goal progress.",
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteGoal: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await GoalService.deleteGoal(req.user!._id, req.params.id as string);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Goal deleted.",
      });
    } catch (error) {
      next(error);
    }
  },
};
