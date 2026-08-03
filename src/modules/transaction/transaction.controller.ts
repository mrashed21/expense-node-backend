import { sendResponse } from "@/helpers/send-response";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { TransactionService } from "./transaction.service";

export const TransactionController = {
  createTransaction: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  getTransactions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await TransactionService.getTransactions(
        req.user!._id,
        req.query,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        meta: result.meta as any,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  getTransactionById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await TransactionService.getTransactionById(
        req.user!._id,
        req.params.id as string,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  updateTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  deleteTransaction: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await TransactionService.deleteTransaction(
        req.user!._id,
        req.params.id as string,
      );
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Transaction deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  restoreTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  bulkDeleteTransactions: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  bulkRestoreTransactions: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  },

  bulkEditTransactions: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  }
};
