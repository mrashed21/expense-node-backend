import { sendResponse } from "@/helpers/send-response";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { NotificationService } from "./notification.service";

export const NotificationController = {
  getNotifications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationService.getUserNotifications(
        req.user!._id,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await NotificationService.markAsRead(
        req.user!._id,
        req.params.id as string,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await NotificationService.markAllAsRead(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All notifications marked as read.",
      });
    } catch (error) {
      next(error);
    }
  },
};
