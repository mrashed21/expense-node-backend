import bcrypt from "bcrypt";
import httpStatus from "http-status";
import ApiError from "../helpers/api-error";
import { User } from "../models/user.model";
import { Otp } from "../models/otp.model";
import { LoginHistory } from "../models/login-history.model";
import { generateToken, verifyToken } from "../utils/jwt";
import { envConfig } from "../config/env-config";
import { sendEmail } from "../utils/send-email";
import { UserStatus } from "../interfaces/user.interface";
import uaparsed from "ua-parser-js";

export const AuthService = {
  // 1. Register User
  register: async (payload: any) => {
    const { user_email, user_password, user_name, user_phone, user_area, user_city, user_country } = payload;

    const existingUser = await User.findOne({ user_email });
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already registered.");
    }

    const hashedPassword = await bcrypt.hash(user_password, 12);

    const newUser = await User.create({
      user_name,
      user_email,
      user_password: hashedPassword,
      user_phone,
      user_area,
      user_city,
      user_country,
      email_verified: false,
    });

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await Otp.create({
      user_email,
      otp_code: otpCode,
      otp_type: "email_verify",
      expires_at: expiresAt,
    });

    // Send Email OTP asynchronously
    sendEmail(
      user_email,
      "Verify Your Expense Tracker Account",
      `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Expense Tracker!</h2>
        <p>Your email verification OTP code is: <strong style="font-size: 24px; color: #4F46E5;">${otpCode}</strong></p>
        <p>This code expires in 10 minutes.</p>
      </div>`
    ).catch(console.error);

    return {
      _id: newUser._id,
      user_name: newUser.user_name,
      user_email: newUser.user_email,
      email_verified: newUser.email_verified,
    };
  },

  // 2. Verify OTP
  verifyOtp: async (user_email: string, otp_code: string) => {
    const otpRecord = await Otp.findOne({
      user_email,
      otp_code,
      otp_type: "email_verify",
      is_used: false,
      expires_at: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired OTP code.");
    }

    otpRecord.is_used = true;
    await otpRecord.save();

    await User.findOneAndUpdate({ user_email }, { email_verified: true });

    return true;
  },

  // 3. Login User
  login: async (payload: any, clientInfo: { ip: string; userAgent: string }) => {
    const { user_email, user_password } = payload;

    const user = await User.findOne({ user_email }).select("+user_password");
    if (!user || user.is_deleted) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    if (user.user_status !== UserStatus.ACTIVE) {
      throw new ApiError(httpStatus.FORBIDDEN, "Your account has been deactivated or banned.");
    }

    const isMatch = await bcrypt.compare(user_password, user.user_password!);
    if (!isMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    // Record Login History
    const ua = uaparsed(clientInfo.userAgent);
    const deviceInfo = `${ua.device.vendor || "Desktop"} ${ua.device.model || ""}`.trim() || "Desktop";
    const browserInfo = `${ua.browser.name || "Unknown Browser"} ${ua.browser.version || ""}`.trim();

    await LoginHistory.create({
      user_id: user._id,
      ip_address: clientInfo.ip,
      user_agent: clientInfo.userAgent,
      device_info: deviceInfo,
      browser: browserInfo,
      timestamp: new Date(),
    });

    user.last_login = new Date();
    await user.save();

    const jwtPayload = {
      _id: user._id.toString(),
      user_role: user.user_role,
      user_email: user.user_email,
      token_version: user.token_version,
    };

    const accessToken = generateToken(jwtPayload, envConfig.jwt.access_secret, envConfig.jwt.access_expires_in);
    const refreshToken = generateToken(jwtPayload, envConfig.jwt.refresh_secret, envConfig.jwt.refresh_expires_in);

    return {
      user: {
        _id: user._id,
        user_name: user.user_name,
        user_email: user.user_email,
        email_verified: user.email_verified,
        user_role: user.user_role,
        user_profile_image: user.user_profile_image,
        currency: user.currency,
        theme: user.theme,
      },
      accessToken,
      refreshToken,
    };
  },

  // 4. Refresh Token
  refreshToken: async (token: string) => {
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "No refresh token provided.");
    }

    const decoded = verifyToken(token, envConfig.jwt.refresh_secret);
    const user = await User.findById(decoded._id);

    if (!user || user.is_deleted || user.user_status !== UserStatus.ACTIVE) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User account unavailable.");
    }

    if (user.token_version !== decoded.token_version) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token invalidated due to device logout.");
    }

    const jwtPayload = {
      _id: user._id.toString(),
      user_role: user.user_role,
      user_email: user.user_email,
      token_version: user.token_version,
    };

    const newAccessToken = generateToken(jwtPayload, envConfig.jwt.access_secret, envConfig.jwt.access_expires_in);
    const newRefreshToken = generateToken(jwtPayload, envConfig.jwt.refresh_secret, envConfig.jwt.refresh_expires_in);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  // 5. Logout All Devices
  logoutAllDevices: async (userId: string) => {
    await User.findByIdAndUpdate(userId, { $inc: { token_version: 1 } });
    return true;
  },

  // 6. Forgot Password
  forgotPassword: async (user_email: string) => {
    const user = await User.findOne({ user_email, is_deleted: false });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "No account registered with this email.");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({
      user_email,
      otp_code: otpCode,
      otp_type: "forgot_password",
      expires_at: expiresAt,
    });

    sendEmail(
      user_email,
      "Password Reset Code - Expense Tracker",
      `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Your password reset OTP code is: <strong style="font-size: 24px; color: #EF4444;">${otpCode}</strong></p>
        <p>This code expires in 10 minutes.</p>
      </div>`
    ).catch(console.error);

    return true;
  },

  // 7. Reset Password
  resetPassword: async (payload: any) => {
    const { user_email, otp_code, new_password } = payload;

    const otpRecord = await Otp.findOne({
      user_email,
      otp_code,
      otp_type: "forgot_password",
      is_used: false,
      expires_at: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired reset code.");
    }

    otpRecord.is_used = true;
    await otpRecord.save();

    const hashedPassword = await bcrypt.hash(new_password, 12);
    await User.findOneAndUpdate(
      { user_email },
      {
        user_password: hashedPassword,
        password_changed_at: new Date(),
        $inc: { token_version: 1 },
      }
    );

    return true;
  },
};
