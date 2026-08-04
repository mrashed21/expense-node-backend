import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { BudgetService } from "./budget.service";

export const BudgetController = {
  createBudget: catchAsync(async (req: Request, res: Response) => {
    const budget = await BudgetService.createBudget(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Budget configured successfully.",
      data: budget,
    });
  }),

  getBudgets: catchAsync(async (req: Request, res: Response) => {
    const budgets = await BudgetService.getBudgets(
      req.user!._id,
      req.query.month_year as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: budgets,
    });
  }),

  deleteBudget: catchAsync(async (req: Request, res: Response) => {
    await BudgetService.deleteBudget(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Budget rule deleted.",
    });
  }),
};
