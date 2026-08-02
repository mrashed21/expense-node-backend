import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import os from "os";

import { sendResponse } from "@/helpers/send-response";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { AdminRole } from "./admin.interface";
import { Admin } from "./admin.model";

export const AdminController = {
  // --- USER MANAGEMENT ---
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

      delete updateData.user_password;

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select("-user_password");

      if (!updatedUser) {
        return sendResponse(res, {
          statusCode: httpStatus.NOT_FOUND,
          success: false,
          message: "User not found",
        });
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

      if (req.user?.user_role !== AdminRole.SUPER_ADMIN) {
        return sendResponse(res, {
          statusCode: httpStatus.FORBIDDEN,
          success: false,
          message: "Only super_admin can delete users",
        });
      }

      const deletedUser = await User.findByIdAndUpdate(
        id,
        { is_deleted: true, user_status: "deleted" },
        { new: true },
      );

      if (!deletedUser) {
        return sendResponse(res, {
          statusCode: httpStatus.NOT_FOUND,
          success: false,
          message: "User not found",
        });
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

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { user_status: status },
        { new: true },
      ).select("-user_password");

      if (!updatedUser) {
        return sendResponse(res, {
          statusCode: httpStatus.NOT_FOUND,
          success: false,
          message: "User not found",
        });
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
  },

  // --- ADMIN MANAGEMENT ---
  getAdmins: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await Admin.find({ is_deleted: false })
        .select("-admin_password")
        .sort({ createdAt: -1 });
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
      const { admin_name, admin_email, admin_password, admin_role } = req.body;

      const existingAdmin = await Admin.findOne({ admin_email });
      if (existingAdmin) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: "Admin email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(admin_password, 12);

      const newAdmin = await Admin.create({
        admin_name,
        admin_email,
        admin_password: hashedPassword,
        admin_role: admin_role || AdminRole.ADMIN,
      });

      const adminObj = newAdmin.toObject();
      delete adminObj.admin_password;

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

      // Prevent super admin from changing their own status to inactive/banned
      if (req.user?._id === id) {
        return sendResponse(res, {
          statusCode: httpStatus.BAD_REQUEST,
          success: false,
          message: "You cannot change your own status.",
        });
      }

      const updatedAdmin = await Admin.findByIdAndUpdate(
        id,
        { admin_status: status },
        { new: true },
      ).select("-admin_password");

      if (!updatedAdmin) {
        return sendResponse(res, {
          statusCode: httpStatus.NOT_FOUND,
          success: false,
          message: "Admin not found",
        });
      }

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
};
