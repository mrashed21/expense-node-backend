import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { TransactionService } from "../services/transaction.service";
import { sendResponse } from "../helpers/send-response";

export const TransactionController = {
  createTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await TransactionService.createTransaction(req.user!._id, req.body);
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
      const result = await TransactionService.getTransactions(req.user!._id, req.query);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        meta: result.meta,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TransactionService.deleteTransaction(req.user!._id, req.params.id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Transaction deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
