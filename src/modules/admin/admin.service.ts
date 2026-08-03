import ApiError from "@/helpers/api-error";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { AdminRole } from "./admin.interface";
import { Admin } from "./admin.model";
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

  deleteUser: async (id: string, currentUserRole: string) => {
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
    return true;
  },

  updateUserStatus: async (id: string, status: string) => {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { user_status: status },
      { new: true },
    ).select("-user_password");

    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
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
};
