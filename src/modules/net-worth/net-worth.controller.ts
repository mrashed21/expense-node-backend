import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { NetWorthService } from "./net-worth.service";

export const NetWorthController = {
  getCurrentNetWorth: catchAsync(async (req: Request, res: Response) => {
    // Optionally take a snapshot automatically when they fetch the current net worth
    // to ensure we have a daily record without needing a Cron job
    await NetWorthService.takeDailySnapshot(req.user!._id);

    const data = await NetWorthService.calculateCurrentNetWorth(req.user!._id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data,
    });
  }),

  getNetWorthHistory: catchAsync(async (req: Request, res: Response) => {
    const data = await NetWorthService.getNetWorthHistory(
      req.user!._id,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data,
    });
  }),
};
