import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { UserService } from "../services/user.service";
import { sendResponse } from "../helpers/send-response";
import { clearRefreshTokenCookie } from "../utils/cookie";

export const UserController = {
  // Get Profile
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

  // Update Profile
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await UserService.updateProfile(req.user!._id, req.body);
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

  // Update Profile Image
  updateProfileImage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const imageUrl = req.file?.path || req.body.user_profile_image;
      if (!imageUrl) {
        res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "No image file or URL provided.",
        });
        return;
      }

      const updatedUser = await UserService.updateProfileImage(req.user!._id, imageUrl);
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

  // Change Password
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { current_password, new_password } = req.body;
      await UserService.changePassword(req.user!._id, current_password, new_password);

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

  // Get Login History
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

  // Delete Account
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
