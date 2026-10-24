import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { DpsFdrService } from "./dps-fdr.service";
import { DepositType } from "./dps-fdr.interface";

export const DpsFdrController = {
  create: catchAsync(async (req: Request, res: Response) => sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "DPS/FDR created.", data: await DpsFdrService.create(req.user!._id, req.body) })),
  list: catchAsync(async (req: Request, res: Response) => sendResponse(res, { statusCode: httpStatus.OK, success: true, data: await DpsFdrService.list(req.user!._id, req.query.type as DepositType | undefined) })),
  update: catchAsync(async (req: Request, res: Response) => sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "DPS/FDR updated.", data: await DpsFdrService.update(req.user!._id, req.params.id as string, req.body) })),
  pay: catchAsync(async (req: Request, res: Response) => sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "DPS installment paid.", data: await DpsFdrService.payDps(req.user!._id, req.params.id as string) })),
  close: catchAsync(async (req: Request, res: Response) => sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "DPS/FDR closed.", data: await DpsFdrService.close(req.user!._id, req.params.id as string) })),
};
