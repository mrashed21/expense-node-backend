import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { AnalyticsService } from "./analytics.service";

const getSummary = catchAsync(async (req: Request, res: Response) => {
  const data = await AnalyticsService.getSummary(req.user!._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Analytics summary fetched successfully.",
    data,
  });
});

export const AnalyticsController = { getSummary };
