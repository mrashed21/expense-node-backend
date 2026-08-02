import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import os from "os";
import { User } from "../user/user.model";
import { Transaction } from "../transaction/transaction.model";
import { sendResponse } from "../../helpers/send-response";

export const AdminController = {
  getUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 50;
      const users = await User.find({ is_deleted: false })
        .select("-user_password")
        .sort({ createdAt: -1 })
        .limit(limit);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  getSystemHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const health = {
        uptime: os.uptime(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
        loadAvg: os.loadavg(),
        platform: os.platform(),
      };

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
      const recentTransactions = await Transaction.find()
        .populate("user_id", "user_name user_email user_profile_image")
        .sort({ createdAt: -1 })
        .limit(20);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: recentTransactions,
      });
    } catch (error) {
      next(error);
    }
  },
};
