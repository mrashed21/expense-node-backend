import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { SavedFilterService } from "./saved-filter.service";

const createFilter = catchAsync(async (req: Request, res: Response) => {
  const result = await SavedFilterService.createFilter(req.user!._id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Filter saved successfully",
    data: result,
  });
});

const getFilters = catchAsync(async (req: Request, res: Response) => {
  const type = req.query.type as string;
  const result = await SavedFilterService.getFilters(req.user!._id, type);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Saved filters retrieved successfully",
    data: result,
  });
});

const deleteFilter = catchAsync(async (req: Request, res: Response) => {
  const result = await SavedFilterService.deleteFilter(req.user!._id, req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Saved filter deleted successfully",
    data: result,
  });
});

export const SavedFilterController = {
  createFilter,
  getFilters,
  deleteFilter,
};
