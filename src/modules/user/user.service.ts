import ApiError from "@/helpers/api-error";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { LoginHistory } from "./login-history.model";
import { UserStatus } from "./user.interface";
import { User } from "./user.model";

export const UserService = {
  getProfile: async (userId: string) => {
    const user = await User.findById(userId).select("-user_password").lean();
    if (!user || user.is_deleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "User profile not found.");
    }
    return user;
  },

  updateProfile: async (userId: string, payload: any) => {
    const user = await User.findByIdAndUpdate(userId, payload, {
      new: true,
      runValidators: true,
    }).select("-user_password");
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
    }
    return user;
  },

  updateProfileImage: async (userId: string, imageUrl: string) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { user_profile_image: imageUrl },
      { new: true },
    ).select("-user_password");
    return user;
  },

  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) => {
    const user = await User.findById(userId).select("+user_password");
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.user_password!);
    if (!isMatch) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Current password is incorrect.",
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.user_password = hashedPassword;
    user.password_changed_at = new Date();
    user.token_version += 1;
    await user.save();

    return true;
  },

  getLoginHistory: async (userId: string, limit = 10) => {
    return LoginHistory.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  },

  deleteAccount: async (userId: string) => {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        is_deleted: true,
        user_status: UserStatus.DELETED,
        deleted_at: new Date(),
      },
      { new: true },
    );
    return !!user;
  },
};
