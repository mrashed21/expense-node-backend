import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { envConfig } from "@/config/env-config";
import ApiError from "@/helpers/api-error";
import httpStatus from "http-status";
import { runReminderJobs } from "@/modules/reminder/reminder.cron";
import { runRecurringJobs } from "@/modules/recurring/recurring.cron";
import { Request, Response } from "express";

export const CronController = {
  runReminders: catchAsync(async (req: Request, res: Response) => {
    const secret = req.headers["x-cron-secret"];
    if (secret !== envConfig.cron_secret) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    
    await runReminderJobs();
    
    sendResponse(res, { statusCode: 200, success: true, message: "Reminders executed successfully." });
  }),
  
  runRecurring: catchAsync(async (req: Request, res: Response) => {
    const secret = req.headers["x-cron-secret"];
    if (secret !== envConfig.cron_secret) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    
    await runRecurringJobs();
    
    sendResponse(res, { statusCode: 200, success: true, message: "Recurring tasks executed successfully." });
  })
};
