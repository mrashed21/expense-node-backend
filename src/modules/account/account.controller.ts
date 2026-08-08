import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { AccountService } from "./account.service";

export const AccountController = {
  createAccount: catchAsync(async (req: Request, res: Response) => {
    const account = await AccountService.createAccount(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Account created successfully.",
      data: account,
    });
  }),

  getUserAccounts: catchAsync(async (req: Request, res: Response) => {
    const accounts = await AccountService.getUserAccounts(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: accounts,
    });
  }),

  getAccountById: catchAsync(async (req: Request, res: Response) => {
    const account = await AccountService.getAccountById(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: account,
    });
  }),

  updateAccount: catchAsync(async (req: Request, res: Response) => {
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
  }),

  deleteAccount: catchAsync(async (req: Request, res: Response) => {
    await AccountService.deleteAccount(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Account archived successfully.",
    });
  }),
};
