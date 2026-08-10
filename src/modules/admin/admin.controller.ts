import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { publishToUser } from "../../utils/ably";
import { AdminService } from "./admin.service";

export const AdminController = {
  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const adminId = req.user?._id as string;
    const updateData = req.body;
    const updatedAdmin = await AdminService.updateProfile(adminId, updateData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin profile updated successfully.",
      data: updatedAdmin,
    });
  }),

  updateProfileImage: catchAsync(async (req: Request, res: Response) => {
    const adminId = req.user?._id as string;
    const imageUrl = req.file?.path;

    if (!imageUrl) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "No image file provided.",
      });
    }

    const updatedAdmin = await AdminService.updateProfileImage(
      adminId,
      imageUrl,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin profile image updated successfully.",
      data: updatedAdmin,
    });
  }),

  globalSearch: catchAsync(async (req: Request, res: Response) => {
    const query = (req.query.q as string) || "";
    if (!query || query.length < 2) {
      return res
        .status(200)
        .json({ success: true, message: "Query too short", data: [] });
    }

    const data = await AdminService.globalSearch(query);
    res.status(200).json({ success: true, message: "Search results", data });
  }),

  getUsers: catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const search = (req.query.search as string) || "";
    const filter = (req.query.filter as string) || "all";

    const result = await AdminService.getUsers(limit, page, search, filter);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
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

  getNotificationHistory: catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;

    const data = await AdminService.getNotificationHistory(limit, page);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data,
    });
  }),

  testNotification: catchAsync(async (req: Request, res: Response) => {
    const currentAdminId = req.user?._id as string;

    const notificationData = {
      title: "Test Notification",
      message: "Ably is working perfectly!",
      time: new Date().toISOString(),
      type: "success",
    };

    if (currentAdminId) {
      await publishToUser(currentAdminId, "new_notification", notificationData);
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
    const currentAdminId = req.user?._id as string;

    const count = await AdminService.broadcastNotification(
      { title, message, type },
      currentAdminId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Broadcast sent to ${count} active users.`,
    });
  }),

  createGlobalCategory: catchAsync(async (req: Request, res: Response) => {
    const currentAdminId = req.user?._id as string;
    const category = await AdminService.createGlobalCategory(
      req.body,
      currentAdminId,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Global category created successfully.",
      data: category,
    });
  }),

  updateGlobalCategory: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentAdminId = req.user?._id as string;
    const category = await AdminService.updateGlobalCategory(
      id as string,
      req.body,
      currentAdminId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Global category updated successfully.",
      data: category,
    });
  }),

  deleteGlobalCategory: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentAdminId = req.user?._id as string;
    await AdminService.deleteGlobalCategory(id as string, currentAdminId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Global category deleted successfully.",
    });
  }),
};
