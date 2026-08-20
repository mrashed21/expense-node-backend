import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import {
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie";
import { AdminAuthService } from "./admin-auth.service";

export const AdminAuthController = {
  login: catchAsync(async (req: Request, res: Response) => {
    const result = await AdminAuthService.login(req.body);
    setRefreshTokenCookie(res, result.refreshToken);
    setAccessTokenCookie(res, result.accessToken);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin login successful.",
      data: {
        admin: result.admin,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  }),

  refreshToken: catchAsync(async (req: Request, res: Response) => {
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
  }),

  getMe: catchAsync(async (req: Request, res: Response) => {
    if (!req.user?._id) throw new Error("Unauthorized");
    const admin = await AdminAuthService.getMe(req.user._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin profile retrieved successfully.",
      data: { admin },
    });
  }),

  logout: catchAsync(async (req: Request, res: Response) => {
    clearRefreshTokenCookie(res);
    clearAccessTokenCookie(res);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin logged out successfully.",
    });
  }),

  logoutAllDevices: catchAsync(async (req: Request, res: Response) => {
    if (!req.user?._id) throw new Error("Unauthorized");
    await AdminAuthService.logoutAllDevices(req.user._id);
    clearRefreshTokenCookie(res);
    clearAccessTokenCookie(res);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin successfully logged out from all devices.",
    });
  }),
};
