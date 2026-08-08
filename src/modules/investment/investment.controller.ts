import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { InvestmentService } from "./investment.service";

export const InvestmentController = {
  createInvestment: catchAsync(async (req: Request, res: Response) => {
    const investment = await InvestmentService.createInvestment(
      req.user!._id,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Investment created successfully.",
      data: investment,
    });
  }),

  getInvestments: catchAsync(async (req: Request, res: Response) => {
    const result = await InvestmentService.getInvestments(
      req.user!._id,
      req.query,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      meta: result.meta as any,
      data: result.data,
    });
  }),

  getInvestmentById: catchAsync(async (req: Request, res: Response) => {
    const investment = await InvestmentService.getInvestmentById(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: investment,
    });
  }),

  updateInvestment: catchAsync(async (req: Request, res: Response) => {
    const investment = await InvestmentService.updateInvestment(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Investment updated successfully.",
      data: investment,
    });
  }),

  deleteInvestment: catchAsync(async (req: Request, res: Response) => {
    await InvestmentService.deleteInvestment(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Investment deleted successfully.",
    });
  }),

  restoreInvestment: catchAsync(async (req: Request, res: Response) => {
    const investment = await InvestmentService.restoreInvestment(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Investment restored successfully.",
      data: investment,
    });
  }),
};
