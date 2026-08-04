import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { GoalService } from "./goal.service";

export const GoalController = {
  createGoal: catchAsync(async (req: Request, res: Response) => {
    const goal = await GoalService.createGoal(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Savings goal created.",
      data: goal,
    });
  }),

  getGoals: catchAsync(async (req: Request, res: Response) => {
    const goals = await GoalService.getGoals(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: goals,
    });
  }),

  depositToGoal: catchAsync(async (req: Request, res: Response) => {
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
  }),

  deleteGoal: catchAsync(async (req: Request, res: Response) => {
    await GoalService.deleteGoal(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Goal deleted.",
    });
  }),
};
