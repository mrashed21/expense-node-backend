import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { DataService } from "./data.service";

const exportBackup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const result = await DataService.exportData(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Data backup exported successfully",
    data: result,
  });
});

const restoreBackup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const payload = req.body;
  const result = await DataService.restoreData(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Data backup restored successfully",
    data: result,
  });
});

export const DataController = {
  exportBackup,
  restoreBackup,
};
