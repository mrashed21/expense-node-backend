import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { BillService } from "./bill.service";

export const BillController = {
  createBill: catchAsync(async (req: Request, res: Response) => {
    const bill = await BillService.createBill(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Bill reminder registered.",
      data: bill,
    });
  }),

  getBills: catchAsync(async (req: Request, res: Response) => {
    const bills = await BillService.getBills(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: bills,
    });
  }),

  payBill: catchAsync(async (req: Request, res: Response) => {
    const { account_id, category_id } = req.body;
    const bill = await BillService.payBill(
      req.user!._id,
      req.params.id as string,
      account_id,
      category_id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Bill paid and recorded as an expense transaction.",
      data: bill,
    });
  }),

  deleteBill: catchAsync(async (req: Request, res: Response) => {
    await BillService.deleteBill(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Bill deleted.",
    });
  }),
};
