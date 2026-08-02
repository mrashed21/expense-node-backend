import bcrypt from "bcrypt";
import httpStatus from "http-status";
import ApiError from "../../helpers/api-error";
import { Admin } from "./admin.model";
import { generateToken, verifyToken } from "../../utils/jwt";
import { envConfig } from "../../config/env-config";
import { AdminStatus } from "./admin.interface";

export const AdminAuthService = {
  login: async (payload: any) => {
    const { admin_email, admin_password } = payload;

    const admin = await Admin.findOne({ admin_email }).select("+admin_password");
    if (!admin || admin.is_deleted) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    if (admin.admin_status !== AdminStatus.ACTIVE) {
      throw new ApiError(httpStatus.FORBIDDEN, "Your account has been deactivated or banned.");
    }

    const isMatch = await bcrypt.compare(admin_password, admin.admin_password!);
    if (!isMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    admin.last_login = new Date();
    await admin.save();

    const jwtPayload = {
      _id: admin._id.toString(),
      user_role: admin.admin_role,
      user_email: admin.admin_email,
      token_version: admin.token_version,
      isAdmin: true,
    };

    const accessToken = generateToken(jwtPayload, envConfig.jwt.access_secret, envConfig.jwt.access_expires_in);
    const refreshToken = generateToken(jwtPayload, envConfig.jwt.refresh_secret, envConfig.jwt.refresh_expires_in);

    return {
      admin: {
        _id: admin._id,
        admin_name: admin.admin_name,
        admin_email: admin.admin_email,
        admin_role: admin.admin_role,
        admin_profile_image: admin.admin_profile_image,
      },
      accessToken,
      refreshToken,
    };
  },

  refreshToken: async (token: string) => {
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "No refresh token provided.");
    }

    const decoded = verifyToken(token, envConfig.jwt.refresh_secret);
    const admin = await Admin.findById(decoded._id);

    if (!admin || admin.is_deleted || admin.admin_status !== AdminStatus.ACTIVE) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Admin account unavailable.");
    }

    if (admin.token_version !== decoded.token_version) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token invalidated due to device logout.");
    }

    const jwtPayload = {
      _id: admin._id.toString(),
      user_role: admin.admin_role,
      user_email: admin.admin_email,
      token_version: admin.token_version,
      isAdmin: true,
    };

    const newAccessToken = generateToken(jwtPayload, envConfig.jwt.access_secret, envConfig.jwt.access_expires_in);
    const newRefreshToken = generateToken(jwtPayload, envConfig.jwt.refresh_secret, envConfig.jwt.refresh_expires_in);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      admin: {
        _id: admin._id,
        admin_name: admin.admin_name,
        admin_email: admin.admin_email,
        admin_role: admin.admin_role,
        admin_profile_image: admin.admin_profile_image,
      },
    };
  },

  getMe: async (adminId: string) => {
    const admin = await Admin.findById(adminId);
    if (!admin || admin.is_deleted || admin.admin_status !== AdminStatus.ACTIVE) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Admin account unavailable.");
    }

    return {
      _id: admin._id,
      admin_name: admin.admin_name,
      admin_email: admin.admin_email,
      admin_role: admin.admin_role,
      admin_profile_image: admin.admin_profile_image,
    };
  },

  logoutAllDevices: async (adminId: string) => {
    await Admin.findByIdAndUpdate(adminId, { $inc: { token_version: 1 } });
    return true;
  },
};
