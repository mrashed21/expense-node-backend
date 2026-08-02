import { sendResponse } from "@/helpers/send-response";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { BudgetService } from "./budget.service";

export const BudgetController = {
  createBudget: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budget = await BudgetService.createBudget(req.user!._id, req.body);
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Budget configured successfully.",
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  },

  getBudgets: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const budgets = await BudgetService.getBudgets(
        req.user!._id,
        req.query.month_year as string,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: budgets,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteBudget: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await BudgetService.deleteBudget(req.user!._id, req.params.id as string);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Budget rule deleted.",
      });
    } catch (error) {
      next(error);
    }
  },
};
