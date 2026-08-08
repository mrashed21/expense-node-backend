import { envConfig } from "../../config/env-config";
import ApiError from "../../helpers/api-error";
import { verifyToken as verifyTotp } from "../../helpers/totp.helper";
import { generateToken, verifyToken } from "../../utils/jwt";
import { sendEmail } from "../../utils/send-email";
import {
  emailVerificationTemplate,
  resendOtpTemplate,
  forgotPasswordTemplate,
  newLoginAlertTemplate,
} from "../../utils/email-templates";
import bcrypt from "bcrypt";
import crypto from "crypto";
import httpStatus from "http-status";
import { UAParser } from "ua-parser-js";
import { Device } from "../user/device.model";
import { LoginHistory } from "../user/login-history.model";
import { UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import {
  IClientInfo,
  ILoginPayload,
  IRegisterPayload,
  IResetPasswordPayload,
} from "./auth.interface";
import { Otp } from "./auth.model";

export const AuthService = {
  register: async (payload: IRegisterPayload) => {
    let {
      user_email,
      user_password,
      user_name,
      user_phone,
      user_area,
      user_city,
      user_country,
    } = payload;

    if (!user_phone || user_phone.trim() === "") {
      user_phone = undefined;
    }

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

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    await Otp.create({
      user_email,
      otp_code: hashedOtp,
      otp_type: "email_verify",
      expires_at: expiresAt,
    });

    await sendEmail(
      user_email,
      "Verify Your Expense Tracker Account",
      emailVerificationTemplate(otpCode, user_name),
    );

    return {
      _id: newUser._id,
      user_name: newUser.user_name,
      user_email: newUser.user_email,
      email_verified: newUser.email_verified,
    };
  },

  // 1b. Resend OTP
  resendOtp: async (user_email: string) => {
    const user = await User.findOne({ user_email, is_deleted: false });
    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "User with this email not found.",
      );
    }
    if (user.email_verified) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified.");
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    // Invalidate old OTPs
    await Otp.updateMany(
      { user_email, otp_type: "email_verify" },
      { is_used: true },
    );

    await Otp.create({
      user_email,
      otp_code: hashedOtp,
      otp_type: "email_verify",
      expires_at: expiresAt,
    });

    await sendEmail(
      user_email,
      "Verify Your Expense Tracker Account — New Code",
      resendOtpTemplate(otpCode, user.user_name),
    );

    return true;
  },

  verifyOtp: async (user_email: string, otp_code: string) => {
    const otpRecord = await Otp.findOne({
      user_email,
      otp_type: "email_verify",
      is_used: false,
      expires_at: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid or expired OTP code.",
      );
    }

    const isValidOtp = await bcrypt.compare(otp_code, otpRecord.otp_code);
    if (!isValidOtp) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid or expired OTP code.",
      );
    }

    otpRecord.is_used = true;
    await otpRecord.save();

    await User.findOneAndUpdate({ user_email }, { email_verified: true });

    return true;
  },

  login: async (payload: ILoginPayload, clientInfo: IClientInfo) => {
    const { user_email, user_password } = payload;

    const user = await User.findOne({ user_email }).select(
      "+user_password +two_factor_secret",
    );
    if (!user || user.is_deleted) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    if (user.user_status !== UserStatus.ACTIVE) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Your account has been deactivated or banned.",
      );
    }

    if (!user.email_verified) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Please verify your email address before logging in.",
      );
    }

    const isMatch = await bcrypt.compare(user_password, user.user_password!);
    if (!isMatch) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    const parser = new UAParser(clientInfo.userAgent);
    const ua = parser.getResult();
    const deviceName =
      `${ua.device.vendor || "Desktop"} ${ua.device.model || ""}`.trim() ||
      "Desktop";
    const browserInfo =
      `${ua.browser.name || "Unknown Browser"} ${ua.browser.version || ""}`.trim();

    // 2FA Check
    if (user.two_factor_enabled) {
      const tempPayload = { _id: user._id.toString(), type: "2fa_temp" } as any;
      const tempToken = generateToken(
        tempPayload,
        envConfig.jwt.access_secret,
        "5m",
      );
      return { requires2FA: true, tempToken };
    }

    return await AuthService.finalizeLogin(
      user,
      clientInfo,
      deviceName,
      browserInfo,
    );
  },

  verifyLogin2FA: async (
    payload: { tempToken: string; code: string },
    clientInfo: IClientInfo,
  ) => {
    const { tempToken, code } = payload;
    let decoded: any;
    try {
      decoded = verifyToken(tempToken, envConfig.jwt.access_secret);
    } catch (err) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired temporary token",
      );
    }

    if (decoded.type !== "2fa_temp") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token type");
    }

    const user = await User.findById(decoded._id).select(
      "+two_factor_secret +two_factor_recovery_codes",
    );
    if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "2FA is not enabled for this account",
      );
    }

    // Check TOTP code or Recovery Code
    let isValid = verifyTotp(user.two_factor_secret, code);

    if (!isValid && user.two_factor_recovery_codes?.includes(code)) {
      isValid = true;
      // Remove used recovery code
      user.two_factor_recovery_codes = user.two_factor_recovery_codes.filter(
        (c) => c !== code,
      );
      await user.save();
    }

    if (!isValid) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid 2FA code");
    }

    const parser = new UAParser(clientInfo.userAgent);
    const ua = parser.getResult();
    const deviceName =
      `${ua.device.vendor || "Desktop"} ${ua.device.model || ""}`.trim() ||
      "Desktop";
    const browserInfo =
      `${ua.browser.name || "Unknown Browser"} ${ua.browser.version || ""}`.trim();

    return await AuthService.finalizeLogin(
      user,
      clientInfo,
      deviceName,
      browserInfo,
    );
  },

  finalizeLogin: async (
    user: any,
    clientInfo: IClientInfo,
    deviceName: string,
    browserInfo: string,
  ) => {
    // Device Tracking
    let deviceId = clientInfo.deviceId;
    let isNewDevice = false;

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      isNewDevice = true;
    } else {
      const existingDevice = await Device.findOne({
        user_id: user._id,
        device_id: deviceId,
      });
      if (!existingDevice) {
        isNewDevice = true;
      }
    }

    // Upsert Device
    await Device.findOneAndUpdate(
      { user_id: user._id, device_id: deviceId },
      {
        device_name: deviceName,
        last_active: new Date(),
        ip_address: clientInfo.ip,
        is_trusted: true, // Once logged in successfully, we trust it for now
      },
      { upsert: true },
    );

    // Send New Login Alert
    if (isNewDevice) {
      try {
        await sendEmail(
          user.user_email,
          "New Sign-In Detected — Expense Tracker",
          newLoginAlertTemplate({
            deviceName,
            browser: browserInfo,
            ip: clientInfo.ip,
            time: new Date().toUTCString(),
            userName: user.user_name,
          }),
        );
      } catch (err) {
        console.error("Failed to send login alert email:", err);
      }
    }

    await LoginHistory.create({
      user_id: user._id,
      ip_address: clientInfo.ip,
      user_agent: clientInfo.userAgent,
      device_info: deviceName,
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

    const accessToken = generateToken(
      jwtPayload,
      envConfig.jwt.access_secret,
      envConfig.jwt.access_expires_in,
    );
    const refreshToken = generateToken(
      jwtPayload,
      envConfig.jwt.refresh_secret,
      envConfig.jwt.refresh_expires_in,
    );

    return {
      user: {
        _id: user._id,
        user_name: user.user_name,
        user_email: user.user_email,
        email_verified: user.email_verified,
        user_role: user.user_role,
        user_profile_image: user.user_profile_image,
        user_phone: user.user_phone,
        user_area: user.user_area,
        user_city: user.user_city,
        user_country: user.user_country,
        currency: user.currency,
        theme: user.theme,
      },
      accessToken,
      refreshToken,
      deviceId,
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
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Refresh token invalidated due to device logout.",
      );
    }

    const jwtPayload = {
      _id: user._id.toString(),
      user_role: user.user_role,
      user_email: user.user_email,
      token_version: user.token_version,
    };

    const newAccessToken = generateToken(
      jwtPayload,
      envConfig.jwt.access_secret,
      envConfig.jwt.access_expires_in,
    );
    const newRefreshToken = generateToken(
      jwtPayload,
      envConfig.jwt.refresh_secret,
      envConfig.jwt.refresh_expires_in,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        user_name: user.user_name,
        user_email: user.user_email,
        email_verified: user.email_verified,
        user_role: user.user_role,
        user_profile_image: user.user_profile_image,
        user_phone: user.user_phone,
        user_area: user.user_area,
        user_city: user.user_city,
        user_country: user.user_country,
        currency: user.currency,
        theme: user.theme,
      },
    };
  },

  // Get Current Authenticated User Profile
  getMe: async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || user.is_deleted || user.user_status !== UserStatus.ACTIVE) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User account unavailable.");
    }

    return {
      _id: user._id,
      user_name: user.user_name,
      user_email: user.user_email,
      email_verified: user.email_verified,
      user_role: user.user_role,
      user_profile_image: user.user_profile_image,
      user_phone: user.user_phone,
      user_area: user.user_area,
      user_city: user.user_city,
      user_country: user.user_country,
      currency: user.currency,
      theme: user.theme,
    };
  },

  // 5. Logout All Devices
  logoutAllDevices: async (userId: string) => {
    await User.findByIdAndUpdate(userId, { $inc: { token_version: 1 } });
    // Clear all login history when logging out from all devices
    await LoginHistory.deleteMany({ user_id: userId });
    return true;
  },

  forgotPassword: async (user_email: string) => {
    const user = await User.findOne({ user_email, is_deleted: false });
    if (!user) {
      // Prevent user enumeration: act as if email was sent
      return true;
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    // Invalidate old OTPs
    await Otp.updateMany(
      { user_email, otp_type: "forgot_password" },
      { is_used: true },
    );

    await Otp.create({
      user_email,
      otp_code: hashedOtp,
      otp_type: "forgot_password",
      expires_at: expiresAt,
    });

    await sendEmail(
      user_email,
      "Password Reset Code — Expense Tracker",
      forgotPasswordTemplate(otpCode, user.user_name),
    );

    return true;
  },

  resetPassword: async (payload: IResetPasswordPayload) => {
    const { user_email, otp_code, new_password } = payload;

    const otpRecord = await Otp.findOne({
      user_email,
      otp_type: "forgot_password",
      is_used: false,
      expires_at: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid or expired reset code.",
      );
    }

    const isValidOtp = await bcrypt.compare(otp_code, otpRecord.otp_code);
    if (!isValidOtp) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid or expired reset code.",
      );
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
      },
    );

    return true;
  },
};
