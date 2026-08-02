import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AdminAuthService } from "./admin-auth.service";
import { sendResponse } from "../../helpers/send-response";
import { setRefreshTokenCookie, clearRefreshTokenCookie, setAccessTokenCookie, clearAccessTokenCookie } from "../../utils/cookie";

export const AdminAuthController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AdminAuthService.login(req.body);
      setRefreshTokenCookie(res, result.refreshToken);
      setAccessTokenCookie(res, result.accessToken);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin login successful.",
        data: {
          admin: result.admin,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await AdminAuthService.refreshToken(refreshToken);
      setRefreshTokenCookie(res, result.refreshToken);
      setAccessTokenCookie(res, result.accessToken);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin token refreshed successfully.",
        data: {
          admin: result.admin,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) throw new Error("Unauthorized");
      const admin = await AdminAuthService.getMe(req.user._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin profile retrieved successfully.",
        data: { admin },
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
        message: "Admin logged out successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  logoutAllDevices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) throw new Error("Unauthorized");
      await AdminAuthService.logoutAllDevices(req.user._id);
      clearRefreshTokenCookie(res);
      clearAccessTokenCookie(res);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin successfully logged out from all devices.",
      });
    } catch (error) {
      next(error);
    }
  },
};
