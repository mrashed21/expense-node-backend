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

  testNotification: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const io = req.app.get("io");
      
      const notificationData = {
        title: "Test Notification",
        message: "Socket.IO is working perfectly!",
        time: new Date().toISOString(),
        type: "success"
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

  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await User.create({
        ...req.body,
        email_verified: true, // Auto verify if admin creates
      });

      const userObj = newUser.toObject();
      delete userObj.user_password;

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

      // Prevent updating sensitive fields directly through this route if needed
      delete updateData.user_password;

      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select("-user_password");

      if (!updatedUser) {
        return sendResponse(res, { statusCode: httpStatus.NOT_FOUND, success: false, message: "User not found" });
      }

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
      
      // Super admin check for deleting users (hard or soft)
      if (req.user?.user_role !== "super_admin") {
        return sendResponse(res, { statusCode: httpStatus.FORBIDDEN, success: false, message: "Only super_admin can delete users" });
      }

      // Soft delete
      const deletedUser = await User.findByIdAndUpdate(id, { is_deleted: true, user_status: "deleted" }, { new: true });
      
      if (!deletedUser) {
        return sendResponse(res, { statusCode: httpStatus.NOT_FOUND, success: false, message: "User not found" });
      }

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

      const updatedUser = await User.findByIdAndUpdate(id, { user_status: status }, { new: true }).select("-user_password");

      if (!updatedUser) {
        return sendResponse(res, { statusCode: httpStatus.NOT_FOUND, success: false, message: "User not found" });
      }

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `User status updated to ${status}.`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
};
