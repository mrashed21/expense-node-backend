import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { BillService } from "../services/bill.service";
import { sendResponse } from "../helpers/send-response";

export const BillController = {
  createBill: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bill = await BillService.createBill(req.user!._id, req.body);
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Bill reminder registered.",
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  },

  getBills: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bills = await BillService.getBills(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: bills,
      });
    } catch (error) {
      next(error);
    }
  },

  payBill: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account_id } = req.body;
      const bill = await BillService.payBill(req.user!._id, req.params.id, account_id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Bill paid and recorded as an expense transaction.",
        data: bill,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteBill: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await BillService.deleteBill(req.user!._id, req.params.id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Bill deleted.",
      });
    } catch (error) {
      next(error);
    }
  },
};
