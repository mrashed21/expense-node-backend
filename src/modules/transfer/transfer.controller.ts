import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { TransferService } from "./transfer.service";

export const TransferController = {
  createTransfer: catchAsync(async (req: Request, res: Response) => {
    const transfer = await TransferService.createTransfer(
      req.user!._id,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Funds transferred successfully.",
      data: transfer,
    });
  }),

  getTransfers: catchAsync(async (req: Request, res: Response) => {
    const transfers = await TransferService.getTransfers(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: transfers,
    });
  }),
};
