import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { TransferService } from "./transfer.service";
import { sendResponse } from "../../helpers/send-response";

export const TransferController = {
  createTransfer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transfer = await TransferService.createTransfer(req.user!._id, req.body);
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Funds transferred successfully.",
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  },

  getTransfers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transfers = await TransferService.getTransfers(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: transfers,
      });
    } catch (error) {
      next(error);
    }
  },
};
