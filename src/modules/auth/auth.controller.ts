import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../helpers/send-response";
import { setRefreshTokenCookie, clearRefreshTokenCookie, setAccessTokenCookie, clearAccessTokenCookie } from "../../utils/cookie";

export const AuthController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.register(req.body);
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Registration successful. Please verify your email with the OTP sent.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  resendOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_email } = req.body;
      await AuthService.resendOtp(user_email);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "A new OTP code has been sent to your email.",
      });
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) throw new Error("Unauthorized");
      const user = await AuthService.getMe(req.user._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile retrieved successfully.",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_email, otp_code } = req.body;
      await AuthService.verifyOtp(user_email, otp_code);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Email verified successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientInfo = {
        ip: req.ip || req.socket.remoteAddress || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown User Agent",
      };

      const result = await AuthService.login(req.body, clientInfo);
      setRefreshTokenCookie(res, result.refreshToken);
      setAccessTokenCookie(res, result.accessToken);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Login successful.",
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      clearRefreshTokenCookie(res);
      clearAccessTokenCookie(res);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logged out successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  logoutAllDevices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) throw new Error("Unauthorized");
      await AuthService.logoutAllDevices(req.user._id);
      clearRefreshTokenCookie(res);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Successfully logged out from all devices.",
      });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_email } = req.body;
      await AuthService.forgotPassword(user_email);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset OTP sent to your email.",
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AuthService.resetPassword(req.body);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset successfully. Please log in with your new password.",
      });
    } catch (error) {
      next(error);
    }
  },
};
