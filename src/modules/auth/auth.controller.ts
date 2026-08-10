import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import {
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  setAccessTokenCookie,
  setDeviceIdCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie";
import { AuthService } from "./auth.service";

export const AuthController = {
  getCsrfToken: catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "CSRF token retrieved",
      data: { csrfToken: req.csrfToken },
    });
  }),

  register: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message:
        "Registration successful. Please verify your email with the OTP sent.",
      data: result,
    });
  }),

  resendOtp: catchAsync(async (req: Request, res: Response) => {
    const { user_email } = req.body;
    await AuthService.resendOtp(user_email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "A new OTP code has been sent to your email.",
    });
  }),

  getMe: catchAsync(async (req: Request, res: Response) => {
    if (!req.user?._id) throw new Error("Unauthorized");
    const user = await AuthService.getMe(req.user._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User profile retrieved successfully.",
      data: { user },
    });
  }),

  verifyOtp: catchAsync(async (req: Request, res: Response) => {
    const { user_email, otp_code } = req.body;
    await AuthService.verifyOtp(user_email, otp_code);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Email verified successfully.",
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const clientInfo = {
      ip: req.ip || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Unknown User Agent",
      deviceId: req.cookies.deviceId,
    };

    const result = await AuthService.login(req.body, clientInfo);

    if ("requires2FA" in result && result.requires2FA) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "2FA Verification Required",
        data: {
          requires2FA: true,
          tempToken: result.tempToken,
        },
      });
      return;
    }

    setRefreshTokenCookie(res, (result as any).refreshToken);
    setAccessTokenCookie(res, (result as any).accessToken);

    if ((result as any).deviceId) {
      setDeviceIdCookie(res, (result as any).deviceId);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Login successful.",
      data: {
        user: (result as any).user,
      },
    });
  }),

  verifyLogin2FA: catchAsync(async (req: Request, res: Response) => {
    const clientInfo = {
      ip: req.ip || req.socket.remoteAddress || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "Unknown User Agent",
      deviceId: req.cookies.deviceId,
    };

    const result = await AuthService.verifyLogin2FA(req.body, clientInfo);

    setRefreshTokenCookie(res, result.refreshToken as any);
    setAccessTokenCookie(res, result.accessToken as any);

    if (result.deviceId) {
      setDeviceIdCookie(res, result.deviceId as any);
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Login successful.",
      data: {
        user: result.user,
      },
    });
  }),

  refreshToken: catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const result = await AuthService.refreshToken(refreshToken);
    setRefreshTokenCookie(res, result.refreshToken);
    setAccessTokenCookie(res, result.accessToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Token refreshed successfully.",
      data: {
        user: result.user,
      },
    });
  }),

  logout: catchAsync(async (req: Request, res: Response) => {
    clearRefreshTokenCookie(res);
    clearAccessTokenCookie(res);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Logged out successfully.",
    });
  }),

  logoutAllDevices: catchAsync(async (req: Request, res: Response) => {
    if (!req.user?._id) throw new Error("Unauthorized");
    await AuthService.logoutAllDevices(req.user._id);
    clearRefreshTokenCookie(res);
    clearAccessTokenCookie(res);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Successfully logged out from all devices.",
    });
  }),

  forgotPassword: catchAsync(async (req: Request, res: Response) => {
    const { user_email } = req.body;
    await AuthService.forgotPassword(user_email);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset OTP sent to your email.",
    });
  }),

  resetPassword: catchAsync(async (req: Request, res: Response) => {
    await AuthService.resetPassword(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  }),
};
