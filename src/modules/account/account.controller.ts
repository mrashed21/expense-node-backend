import { sendResponse } from "@/helpers/send-response";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { AccountService } from "./account.service";

export const AccountController = {
  createAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await AccountService.createAccount(
        req.user!._id,
        req.body,
      );
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Account created successfully.",
        data: account,
      });
    } catch (error) {
      next(error);
    }
  },

  getUserAccounts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accounts = await AccountService.getUserAccounts(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  },

  getAccountById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await AccountService.getAccountById(
        req.user!._id,
        req.params.id as string,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  },

  updateAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await AccountService.updateAccount(
        req.user!._id,
        req.params.id as string,
        req.body,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Account updated successfully.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AccountService.deleteAccount(
        req.user!._id,
        req.params.id as string,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Account archived successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
