import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { DebtService } from "./debt.service";

export const DebtController = {
  createDebt: catchAsync(async (req: Request, res: Response) => {
    const debt = await DebtService.createDebt(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Debt recorded successfully.",
      data: debt,
    });
  }),

  getDebts: catchAsync(async (req: Request, res: Response) => {
    const result = await DebtService.getDebts(req.user!._id, req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      meta: result.meta as any,
      data: result.data,
    });
  }),

  getDebtById: catchAsync(async (req: Request, res: Response) => {
    const debt = await DebtService.getDebtById(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: debt,
    });
  }),

  updateDebt: catchAsync(async (req: Request, res: Response) => {
    const debt = await DebtService.updateDebt(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Debt updated successfully.",
      data: debt,
    });
  }),

  deleteDebt: catchAsync(async (req: Request, res: Response) => {
    await DebtService.deleteDebt(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Debt deleted successfully.",
    });
  }),

  addPayment: catchAsync(async (req: Request, res: Response) => {
    const payment = await DebtService.addPayment(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Payment logged successfully.",
      data: payment,
    });
  }),
};
