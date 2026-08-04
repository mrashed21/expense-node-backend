import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { InstallmentService } from "./installment.service";

export const InstallmentController = {
  createInstallment: catchAsync(async (req: Request, res: Response) => {
    const installment = await InstallmentService.createInstallment(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Installment recorded successfully.",
      data: installment,
    });
  }),

  getInstallments: catchAsync(async (req: Request, res: Response) => {
    const result = await InstallmentService.getInstallments(req.user!._id, req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      meta: result.meta as any,
      data: result.data,
    });
  }),

  getInstallmentById: catchAsync(async (req: Request, res: Response) => {
    const installment = await InstallmentService.getInstallmentById(
      req.user!._id,
      req.params.id as string
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: installment,
    });
  }),

  updateInstallment: catchAsync(async (req: Request, res: Response) => {
    const installment = await InstallmentService.updateInstallment(
      req.user!._id,
      req.params.id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Installment updated successfully.",
      data: installment,
    });
  }),

  deleteInstallment: catchAsync(async (req: Request, res: Response) => {
    await InstallmentService.deleteInstallment(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Installment deleted successfully.",
    });
  }),
  
  addPayment: catchAsync(async (req: Request, res: Response) => {
    const payment = await InstallmentService.addPayment(
      req.user!._id,
      req.params.id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "EMI Payment logged successfully.",
      data: payment,
    });
  })
};
