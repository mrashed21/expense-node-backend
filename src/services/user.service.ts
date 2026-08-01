import bcrypt from "bcrypt";
import httpStatus from "http-status";
import ApiError from "../helpers/api-error";
import { User } from "../models/user.model";
import { LoginHistory } from "../models/login-history.model";
import { UserStatus } from "../interfaces/user.interface";

export const UserService = {
  // 1. Get User Profile
  getProfile: async (userId: string) => {
    const user = await User.findById(userId).select("-user_password");
    if (!user || user.is_deleted) {
      throw new ApiError(httpStatus.NOT_FOUND, "User profile not found.");
    }
    return user;
  },

  // 2. Update Profile & Preferences
  updateProfile: async (userId: string, payload: any) => {
    const user = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true }).select("-user_password");
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
    }
    return user;
  },

  // 3. Update Profile Image
  updateProfileImage: async (userId: string, imageUrl: string) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { user_profile_image: imageUrl },
      { new: true }
    ).select("-user_password");
    return user;
  },

  // 4. Change Password
  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await User.findById(userId).select("+user_password");
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.user_password!);
    if (!isMatch) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Current password is incorrect.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.user_password = hashedPassword;
    user.password_changed_at = new Date();
    user.token_version += 1; // Invalidate current session tokens across devices
    await user.save();

    return true;
  },

  // 5. Get Login History
  getLoginHistory: async (userId: string, limit = 10) => {
    return LoginHistory.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit);
  },

  // 6. Delete Account (Soft delete)
  deleteAccount: async (userId: string) => {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        is_deleted: true,
        user_status: UserStatus.DELETED,
        deleted_at: new Date(),
      },
      { new: true }
    );
    return !!user;
  },
};
