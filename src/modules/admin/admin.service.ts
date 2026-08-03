import ApiError from "@/helpers/api-error";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { AdminRole } from "./admin.interface";
import { Admin } from "./admin.model";
import { AuditLog } from "./audit-log.model";
import { ErrorLog } from "./error-log.model";
import { Notification } from "../notification/notification.model";
import os from "os";

export const AdminService = {
  getUsers: async (limit: number) => {
    return User.find({ is_deleted: false })
      .select("-user_password")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  createUser: async (payload: any) => {
    const newUser = await User.create({
      ...payload,
      email_verified: true, // Auto verify if admin creates
    });
    const userObj = newUser.toObject();
    delete userObj.user_password;
    return userObj;
  },

  updateUser: async (id: string, updateData: any) => {
    delete updateData.user_password;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-user_password");

    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    return updatedUser;
  },

  deleteUser: async (id: string, currentAdminId: string, currentUserRole: string) => {
    if (currentUserRole !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(httpStatus.FORBIDDEN, "Only super_admin can delete users");
    }

    const deletedUser = await User.findByIdAndUpdate(
      id,
      { is_deleted: true, user_status: "deleted" },
      { new: true },
    );

    if (!deletedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    AuditLog.create({
      admin_id: currentAdminId,
      action: "DELETE_USER",
      target_id: id,
    }).catch(console.error);

    return true;
  },

  updateUserStatus: async (id: string, status: string, currentAdminId: string) => {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { user_status: status },
      { new: true },
    ).select("-user_password");

    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    AuditLog.create({
      admin_id: currentAdminId,
      action: "UPDATE_USER_STATUS",
      target_id: id,
      details: { status },
    }).catch(console.error);

    return updatedUser;
  },

  getAdmins: async () => {
    return Admin.find({ is_deleted: false })
      .select("-admin_password")
      .sort({ createdAt: -1 })
      .lean();
  },

  createAdmin: async (payload: any) => {
    const { admin_name, admin_email, admin_password, admin_role } = payload;

    const existingAdmin = await Admin.findOne({ admin_email });
    if (existingAdmin) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Admin email already exists");
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

    AuditLog.create({
      admin_id: payload.creatorId, // passed from controller
      action: "CREATE_ADMIN",
      target_id: newAdmin._id,
      details: { email: admin_email, role: admin_role },
    }).catch(console.error);

    return adminObj;
  },

  updateAdminStatus: async (id: string, status: string, currentAdminId: string) => {
    if (currentAdminId === id) {
      throw new ApiError(httpStatus.BAD_REQUEST, "You cannot change your own status.");
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { admin_status: status },
      { new: true },
    ).select("-admin_password");

    if (!updatedAdmin) {
      throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
    }

    AuditLog.create({
      admin_id: currentAdminId,
      action: "UPDATE_ADMIN_STATUS",
      target_id: id,
      details: { status },
    }).catch(console.error);

    return updatedAdmin;
  },

  getActivity: async () => {
    return Transaction.find()
      .populate("user_id", "user_name user_email user_profile_image")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  },

  getSystemHealth: () => {
    return {
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      loadAvg: os.loadavg(),
      platform: os.platform(),
    };
  },

  getDashboardStats: async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, totalAdmins, totalTransactions, activeUsers] = await Promise.all([
      User.countDocuments({ is_deleted: false }),
      Admin.countDocuments({ is_deleted: false }),
      Transaction.countDocuments(),
      User.countDocuments({ last_login: { $gte: thirtyDaysAgo }, is_deleted: false }),
    ]);

    return { totalUsers, totalAdmins, totalTransactions, activeUsers };
  },

  getUserGrowth: async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return growth.map((g) => ({ date: g._id, users: g.count }));
  },

  getErrorLogs: async (limit: number) => {
    return ErrorLog.find().sort({ timestamp: -1 }).limit(limit).lean();
  },

  getAuditLogs: async (limit: number) => {
    return AuditLog.find()
      .populate("admin_id", "admin_name admin_email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  broadcastNotification: async (payload: { title: string; message: string; type: string }, currentAdminId: string, io: any) => {
    const activeUsers = await User.find({ user_status: "active", is_deleted: false }).select("_id");
    
    if (activeUsers.length === 0) return 0;

    const notifications = activeUsers.map(user => ({
      user_id: user._id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      read: false,
    }));

    await Notification.insertMany(notifications);

    // Broadcast event to all connected clients
    if (io) {
      io.emit("new_notification", {
        title: payload.title,
        message: payload.message,
        type: payload.type,
      });
    }

    AuditLog.create({
      admin_id: currentAdminId,
      action: "BROADCAST_NOTIFICATION",
      details: { title: payload.title, count: activeUsers.length },
    }).catch(console.error);

    return activeUsers.length;
  },
};
