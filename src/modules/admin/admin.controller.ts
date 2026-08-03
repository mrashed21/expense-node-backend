import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import { sendResponse } from "@/helpers/send-response";
import { AdminService } from "./admin.service";

export const AdminController = {
  // --- USER MANAGEMENT ---
  getUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 50;
      const users = await AdminService.getUsers(limit);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = { ...req.body, creatorId: req.user?._id };
      const userObj = await AdminService.createUser(payload);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully by admin.",
        data: userObj,
      });
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedUser = await AdminService.updateUser(
        id as string,
        updateData,
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const role = req.user?.user_role || "";
      const currentAdminId = req.user?._id as string;

      await AdminService.deleteUser(id as string, currentAdminId, role);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  updateUserStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const currentAdminId = req.user?._id as string;

      const updatedUser = await AdminService.updateUserStatus(
        id as string,
        status,
        currentAdminId,
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `User status updated to ${status}.`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // --- ADMIN MANAGEMENT ---
  getAdmins: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await AdminService.getAdmins();
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: admins,
      });
    } catch (error) {
      next(error);
    }
  },

  createAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = { ...req.body, creatorId: req.user?._id };
      const adminObj = await AdminService.createAdmin(payload);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Admin created successfully.",
        data: adminObj,
      });
    } catch (error) {
      next(error);
    }
  },

  updateAdminStatus: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const currentAdminId = req.user?._id as string;

      const updatedAdmin = await AdminService.updateAdminStatus(
        id as string,
        status,
        currentAdminId,
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Admin status updated to ${status}.`,
        data: updatedAdmin,
      });
    } catch (error) {
      next(error);
    }
  },

  // --- SYSTEM & OTHERS ---
  getSystemHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const health = AdminService.getSystemHealth();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: health,
      });
    } catch (error) {
      next(error);
    }
  },

  getActivity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recentTransactions = await AdminService.getActivity();

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: recentTransactions,
      });
    } catch (error) {
      next(error);
    }
  },

  testNotification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const io = req.app.get("io");

      const notificationData = {
        title: "Test Notification",
        message: "Socket.IO is working perfectly!",
        time: new Date().toISOString(),
        type: "success",
      };

      if (io) {
        io.emit("new_notification", notificationData);
      }

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Test notification sent successfully",
        data: notificationData,
      });
    } catch (error) {
      next(error);
    }
  },

  getDashboardStats: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const stats = await AdminService.getDashboardStats();
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  getUserGrowth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const growth = await AdminService.getUserGrowth();
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: growth,
      });
    } catch (error) {
      next(error);
    }
  },

  getErrorLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 100;
      const logs = await AdminService.getErrorLogs(limit);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },

  getAuditLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 100;
      const logs = await AdminService.getAuditLogs(limit);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },

  broadcastNotification: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { title, message, type } = req.body;
      const io = req.app.get("io");
      const currentAdminId = req.user?._id as string;

      const count = await AdminService.broadcastNotification(
        { title, message, type },
        currentAdminId,
        io,
      );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Broadcast sent to ${count} active users.`,
      });
    } catch (error) {
      next(error);
    }
  },
};
