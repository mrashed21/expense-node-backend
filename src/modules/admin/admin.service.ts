import bcrypt from "bcrypt";
import httpStatus from "http-status";
import os from "os";
import ApiError from "../../helpers/api-error";
import { Notification } from "../../modules/notification/notification.model";
import { Transaction } from "../../modules/transaction/transaction.model";
import { publishToUser } from "../../utils/ably";
import { Category } from "../category/category.model";
import { UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { AdminRole } from "./admin.interface";
import { Admin } from "./admin.model";
import { AuditLog } from "./audit-log.model";
import { ErrorLog } from "./error-log.model";

export const AdminService = {
  updateProfile: async (adminId: string, payload: any) => {
    const allowedKeys = [
      "admin_name",
      "admin_phone",
      "admin_area",
      "admin_city",
      "admin_country",
      "currency",
      "language",
      "timezone",
      "theme",
      "date_format",
      "number_format",
    ];

    const sanitizedPayload = Object.keys(payload)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = payload[key];
        return obj;
      }, {} as any);

    const admin = await Admin.findByIdAndUpdate(adminId, sanitizedPayload, {
      new: true,
      runValidators: true,
    }).select("-admin_password");
    if (!admin) {
      throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
    }
    return admin;
  },

  updateProfileImage: async (adminId: string, imageUrl: string) => {
    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { admin_profile_image: imageUrl },
      { new: true },
    ).select("-admin_password");
    if (!admin) {
      throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
    }
    return admin;
  },

  globalSearch: async (query: string) => {
    const regex = new RegExp(query, "i");
    const results: any[] = [];

    const users = await User.find({
      is_deleted: false,
      $or: [
        { user_name: { $regex: regex } },
        { user_email: { $regex: regex } },
      ],
    })
      .limit(10)
      .lean();

    users.forEach((u) => {
      results.push({
        id: u._id.toString(),
        type: "user",
        title: u.user_name || "Unknown User",
        subtitle: `User • ${u.user_email}`,
        url: `/admin/users`,
      });
    });

    const admins = await Admin.find({
      is_deleted: false,
      $or: [
        { admin_name: { $regex: regex } },
        { admin_email: { $regex: regex } },
      ],
    })
      .limit(5)
      .lean();

    admins.forEach((a) => {
      results.push({
        id: a._id.toString(),
        type: "admin",
        title: a.admin_name,
        subtitle: `Admin • ${a.admin_role}`,
        url: `/admin/admins`,
      });
    });

    return results;
  },
  getUsers: async (
    limit: number,
    page: number = 1,
    search: string = "",
    filter: string = "all",
  ) => {
    const query: any = { is_deleted: false };

    if (search) {
      query.$or = [
        { user_name: { $regex: search, $options: "i" } },
        { user_email: { $regex: search, $options: "i" } },
      ];
    }

    if (filter === "active") query.user_status = "active";
    if (filter === "inactive") query.user_status = { $ne: "active" };

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select("-user_password -two_factor_secret -two_factor_recovery_codes")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [totalTransactions, totalCategories] = await Promise.all([
          Transaction.countDocuments({ user_id: user._id }),
          Category.countDocuments({ user_id: user._id, is_deleted: false }),
        ]);
        return {
          ...user,
          total_transactions: totalTransactions,
          total_categories: totalCategories,
        };
      }),
    );

    return {
      users: usersWithStats,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },

  createUser: async (payload: any) => {
    const newUser = await User.create({
      ...payload,
      email_verified: true,
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

  deleteUser: async (
    id: string,
    currentAdminId: string,
    currentUserRole: string,
  ) => {
    if (currentUserRole !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Only super_admin can delete users",
      );
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

  updateUserStatus: async (
    id: string,
    status: string,
    currentAdminId: string,
  ) => {
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
      admin_id: payload.creatorId,
      target_id: newAdmin._id,
      details: { email: admin_email, role: admin_role },
    }).catch(console.error);

    return adminObj;
  },

  updateAdminStatus: async (
    id: string,
    status: string,
    currentAdminId: string,
  ) => {
    if (currentAdminId === id) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You cannot change your own status.",
      );
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

  getNotificationHistory: async (limit: number, page: number) => {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .populate("user_id", "user_name user_email user_profile_image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments();

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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

    const [totalUsers, totalAdmins, totalTransactions, activeUsers] =
      await Promise.all([
        User.countDocuments({ is_deleted: false }),
        Admin.countDocuments({ is_deleted: false }),
        Transaction.countDocuments(),
        User.countDocuments({
          last_login: { $gte: thirtyDaysAgo },
          is_deleted: false,
        }),
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

  broadcastNotification: async (
    payload: { title: string; message: string; type: string },
    currentAdminId: string,
  ) => {
    const activeUsers = await User.find({
      user_status: UserStatus.ACTIVE,
      is_deleted: false,
    }).select("_id");

    if (activeUsers.length === 0) return 0;

    const notifications = activeUsers.map((user) => ({
      user_id: user._id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      read: false,
    }));

    await Notification.insertMany(notifications);

    await Promise.all(
      activeUsers.map((user) =>
        publishToUser(user._id.toString(), "new_notification", {
          title: payload.title,
          message: payload.message,
          type: payload.type,
        }),
      ),
    );

    AuditLog.create({
      admin_id: currentAdminId,
      action: "BROADCAST_NOTIFICATION",
      details: { title: payload.title, count: activeUsers.length },
    }).catch(console.error);

    return activeUsers.length;
  },

  createGlobalCategory: async (payload: any, currentAdminId: string) => {
    const newCategory = await Category.create({
      ...payload,
      is_default: true,
      user_id: null,
    });

    AuditLog.create({
      admin_id: currentAdminId,
      action: "CREATE_GLOBAL_CATEGORY",
      target_id: newCategory._id,
      details: { name: payload.name },
    }).catch(console.error);

    return newCategory;
  },

  updateGlobalCategory: async (
    categoryId: string,
    payload: any,
    currentAdminId: string,
  ) => {
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId, is_default: true, is_deleted: false },
      payload,
      { new: true, runValidators: true },
    );

    if (!updatedCategory)
      throw new ApiError(httpStatus.NOT_FOUND, "Global category not found");

    AuditLog.create({
      admin_id: currentAdminId,
      action: "UPDATE_GLOBAL_CATEGORY",
      target_id: categoryId,
    }).catch(console.error);

    return updatedCategory;
  },

  deleteGlobalCategory: async (categoryId: string, currentAdminId: string) => {
    const deletedCategory = await Category.findOneAndUpdate(
      { _id: categoryId, is_default: true, is_deleted: false },
      { is_deleted: true },
      { new: true },
    );

    if (!deletedCategory)
      throw new ApiError(httpStatus.NOT_FOUND, "Global category not found");

    AuditLog.create({
      admin_id: currentAdminId,
      action: "DELETE_GLOBAL_CATEGORY",
      target_id: categoryId,
    }).catch(console.error);

    return true;
  },
};
