import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { AdminService } from "./admin.service";

export const AdminController = {
  // --- USER MANAGEMENT ---
  getUsers: catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 50;
    const users = await AdminService.getUsers(limit);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: users,
    });
  }),

  createUser: catchAsync(async (req: Request, res: Response) => {
    const payload = { ...req.body, creatorId: req.user?._id };
    const userObj = await AdminService.createUser(payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully by admin.",
      data: userObj,
    });
  }),

  updateUser: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await AdminService.updateUser(id as string, updateData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  }),

  deleteUser: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = req.user?.user_role || "";
    const currentAdminId = req.user?._id as string;

    await AdminService.deleteUser(id as string, currentAdminId, role);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User deleted successfully.",
    });
  }),

  updateUserStatus: catchAsync(async (req: Request, res: Response) => {
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
  }),

  // --- ADMIN MANAGEMENT ---
  getAdmins: catchAsync(async (req: Request, res: Response) => {
    const admins = await AdminService.getAdmins();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: admins,
    });
  }),

  createAdmin: catchAsync(async (req: Request, res: Response) => {
    const payload = { ...req.body, creatorId: req.user?._id };
    const adminObj = await AdminService.createAdmin(payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Admin created successfully.",
      data: adminObj,
    });
  }),

  updateAdminStatus: catchAsync(async (req: Request, res: Response) => {
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
  }),

  // --- SYSTEM & OTHERS ---
  getSystemHealth: catchAsync(async (req: Request, res: Response) => {
    const health = AdminService.getSystemHealth();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: health,
    });
  }),

  getActivity: catchAsync(async (req: Request, res: Response) => {
    const recentTransactions = await AdminService.getActivity();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: recentTransactions,
    });
  }),

  testNotification: catchAsync(async (req: Request, res: Response) => {
    const io = req.app.get("io");
    const currentAdminId = req.user?._id as string;

    const notificationData = {
      title: "Test Notification",
      message: "Socket.IO is working perfectly!",
      time: new Date().toISOString(),
      type: "success",
    };

    if (io && currentAdminId) {
      io.to(currentAdminId).emit("new_notification", notificationData);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Test notification sent successfully",
      data: notificationData,
    });
  }),

  getDashboardStats: catchAsync(async (req: Request, res: Response) => {
    const stats = await AdminService.getDashboardStats();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: stats,
    });
  }),

  getUserGrowth: catchAsync(async (req: Request, res: Response) => {
    const growth = await AdminService.getUserGrowth();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: growth,
    });
  }),

  getErrorLogs: catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 100;
    const logs = await AdminService.getErrorLogs(limit);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: logs,
    });
  }),

  getAuditLogs: catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 100;
    const logs = await AdminService.getAuditLogs(limit);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: logs,
    });
  }),

  broadcastNotification: catchAsync(async (req: Request, res: Response) => {
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
  }),
};
