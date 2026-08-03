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
};
