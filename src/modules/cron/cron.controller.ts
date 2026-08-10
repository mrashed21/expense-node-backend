import { Request, Response } from "express";
import httpStatus from "http-status";
import { envConfig } from "../../config/env-config";
import ApiError from "../../helpers/api-error";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { runRecurringJobs } from "../../modules/recurring/recurring.cron";
import { runReminderJobs } from "../../modules/reminder/reminder.cron";

const isValidCronRequest = (req: Request): boolean => {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader === `Bearer ${envConfig.cron_secret}`) {
    return true;
  }
  const customSecret = req.headers["x-cron-secret"];
  if (customSecret && customSecret === envConfig.cron_secret) {
    return true;
  }
  return false;
};

export const CronController = {
  runReminders: catchAsync(async (req: Request, res: Response) => {
    if (!isValidCronRequest(req)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    const stats = await runReminderJobs();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reminders executed successfully.",
      data: stats,
    });
  }),

  runRecurring: catchAsync(async (req: Request, res: Response) => {
    if (!isValidCronRequest(req)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    await runRecurringJobs();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recurring tasks executed successfully.",
    });
  }),
};
