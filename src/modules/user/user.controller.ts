import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { sendResponse } from "@/helpers/send-response";
import { clearRefreshTokenCookie } from "@/utils/cookie";
import { UserService } from "./user.service";

export const UserController = {
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserService.getProfile(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  updateProfileImage: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  getLoginHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await UserService.getLoginHistory(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserService.deleteAccount(req.user!._id);
      clearRefreshTokenCookie(res);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your account has been deleted.",
      });
    } catch (error) {
      next(error);
    }
  },

  generate2FA: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await UserService.generate2FA(req.user!._id, req.user!.user_email || "user@expensevault.com");
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  verify2FA: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await UserService.verify2FA(req.user!._id, req.body.code);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "2FA enabled successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  disable2FA: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserService.disable2FA(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "2FA disabled successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  getDevices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const devices = await UserService.getDevices(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  },

  revokeDevice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserService.revokeDevice(req.user!._id, req.params.id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Device revoked successfully",
      });
    } catch (error) {
      next(error);
    }
  }
};
