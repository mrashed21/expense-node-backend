import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { clearRefreshTokenCookie } from "@/utils/cookie";
import { UserService } from "./user.service";

export const UserController = {
  getProfile: catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getProfile(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: user,
    });
  }),

  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const updatedUser = await UserService.updateProfile(
      req.user!._id,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  }),

  updateProfileImage: catchAsync(async (req: Request, res: Response) => {
    const imageUrl = req.file?.path;
    if (!imageUrl) {
      res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "No image file or URL provided.",
      });
      return;
    }

    const updatedUser = await UserService.updateProfileImage(
      req.user!._id,
      imageUrl,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile image updated successfully.",
      data: updatedUser,
    });
  }),

  changePassword: catchAsync(async (req: Request, res: Response) => {
    const { current_password, new_password } = req.body;
    await UserService.changePassword(
      req.user!._id,
      current_password,
      new_password,
    );

    clearRefreshTokenCookie(res);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  }),

  getLoginHistory: catchAsync(async (req: Request, res: Response) => {
    const history = await UserService.getLoginHistory(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: history,
    });
  }),

  deleteAccount: catchAsync(async (req: Request, res: Response) => {
    await UserService.deleteAccount(req.user!._id);
    clearRefreshTokenCookie(res);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Your account has been deleted.",
    });
  }),

  generate2FA: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.generate2FA(req.user!._id, req.user!.user_email || "user@expensevault.com");
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  }),

  verify2FA: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.verify2FA(req.user!._id, req.body.code);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "2FA enabled successfully",
      data: result,
    });
  }),

  disable2FA: catchAsync(async (req: Request, res: Response) => {
    await UserService.disable2FA(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "2FA disabled successfully",
    });
  }),

  getDevices: catchAsync(async (req: Request, res: Response) => {
    const devices = await UserService.getDevices(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: devices,
    });
  }),

  revokeDevice: catchAsync(async (req: Request, res: Response) => {
    await UserService.revokeDevice(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Device revoked successfully",
    });
  })
};
