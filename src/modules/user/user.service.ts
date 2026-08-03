import ApiError from "@/helpers/api-error";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { LoginHistory } from "./login-history.model";
import { UserStatus } from "./user.interface";
import { User } from "./user.model";
import { Device } from "./device.model";
import crypto from "crypto";
import { generateSecret, generateAuthURI, verifyToken } from "@/helpers/totp.helper";

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

  generate2FA: async (userId: string, email: string) => {
    const user = await User.findById(userId).select("+two_factor_secret");
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    if (user.two_factor_enabled) {
      throw new ApiError(httpStatus.BAD_REQUEST, "2FA is already enabled");
    }

    const secret = generateSecret();
    user.two_factor_secret = secret;
    await user.save();

    const qrData = generateAuthURI(secret, email);
    // Return the base64 qr code data URI
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

    return { qrCodeUrl, secret };
  },

  verify2FA: async (userId: string, code: string) => {
    const user = await User.findById(userId).select("+two_factor_secret +two_factor_recovery_codes");
    if (!user || !user.two_factor_secret) {
      throw new ApiError(httpStatus.BAD_REQUEST, "2FA setup not initialized");
    }

    const isValid = verifyToken(user.two_factor_secret, code);
    if (!isValid) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid 2FA code");
    }

    // Generate 10 recovery codes
    const recoveryCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
    
    user.two_factor_enabled = true;
    user.two_factor_recovery_codes = recoveryCodes;
    await user.save();

    return { recoveryCodes };
  },

  disable2FA: async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    user.two_factor_enabled = false;
    user.two_factor_secret = undefined;
    user.two_factor_recovery_codes = undefined;
    await user.save();

    return true;
  },

  getDevices: async (userId: string) => {
    return Device.find({ user_id: userId })
      .sort({ last_active: -1 })
      .lean();
  },

  revokeDevice: async (userId: string, deviceId: string) => {
    const result = await Device.findOneAndDelete({ user_id: userId, _id: deviceId });
    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, "Device not found");
    }
    return true;
  }
};
