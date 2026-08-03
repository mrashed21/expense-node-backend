import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { DebtService } from "./debt.service";

const createDebt = catchAsync(async (req: Request, res: Response) => {
  const result = await DebtService.createDebt(req.user!._id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Debt created successfully",
    data: result,
  });
});

const getDebts = catchAsync(async (req: Request, res: Response) => {
  const result = await DebtService.getDebts(req.user!._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Debts retrieved successfully",
    data: result,
  });
});

const updateDebt = catchAsync(async (req: Request, res: Response) => {
  const result = await DebtService.updateDebt(
    req.user!._id,
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Debt updated successfully",
    data: result,
  });
});

const deleteDebt = catchAsync(async (req: Request, res: Response) => {
  await DebtService.deleteDebt(req.user!._id, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Debt deleted successfully",
    data: null,
  });
});

export const DebtController = {
  createDebt,
  getDebts,
  updateDebt,
  deleteDebt,
};
