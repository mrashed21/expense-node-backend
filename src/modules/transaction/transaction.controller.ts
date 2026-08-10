import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { TransactionService } from "./transaction.service";

export const TransactionController = {
  createTransaction: catchAsync(async (req: Request, res: Response) => {
    const transaction = await TransactionService.createTransaction(
      req.user!._id,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Transaction recorded successfully.",
      data: transaction,
    });
  }),

  getTransactions: catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.getTransactions(
      req.user!._id,
      req.query as any,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      meta: result.meta as any,
      data: result.data,
    });
  }),

  getTransactionById: catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.getTransactionById(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
    });
  }),

  updateTransaction: catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.updateTransaction(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transaction updated successfully.",
      data: result,
    });
  }),

  deleteTransaction: catchAsync(async (req: Request, res: Response) => {
    await TransactionService.deleteTransaction(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transaction deleted successfully.",
    });
  }),

  restoreTransaction: catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.restoreTransaction(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transaction restored successfully.",
      data: result,
    });
  }),

  bulkDeleteTransactions: catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.bulkDeleteTransactions(
      req.user!._id,
      req.body.ids,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transactions deleted successfully.",
      data: result,
    });
  }),

  bulkRestoreTransactions: catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.bulkRestoreTransactions(
      req.user!._id,
      req.body.ids,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transactions restored successfully.",
      data: result,
    });
  }),

  bulkEditTransactions: catchAsync(async (req: Request, res: Response) => {
    const result = await TransactionService.bulkEditTransactions(
      req.user!._id,
      req.body.ids,
      req.body.payload,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transactions updated successfully.",
      data: result,
    });
  }),
};
