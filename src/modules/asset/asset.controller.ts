import catchAsync from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { AssetService } from "./asset.service";

export const AssetController = {
  createAsset: catchAsync(async (req: Request, res: Response) => {
    const asset = await AssetService.createAsset(req.user!._id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Asset created successfully.",
      data: asset,
    });
  }),

  getAssets: catchAsync(async (req: Request, res: Response) => {
    const result = await AssetService.getAssets(req.user!._id, req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      meta: result.meta as any,
      data: result.data,
    });
  }),

  getAssetById: catchAsync(async (req: Request, res: Response) => {
    const asset = await AssetService.getAssetById(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: asset,
    });
  }),

  updateAsset: catchAsync(async (req: Request, res: Response) => {
    const asset = await AssetService.updateAsset(
      req.user!._id,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Asset updated successfully.",
      data: asset,
    });
  }),

  deleteAsset: catchAsync(async (req: Request, res: Response) => {
    await AssetService.deleteAsset(req.user!._id, req.params.id as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Asset deleted successfully.",
    });
  }),

  restoreAsset: catchAsync(async (req: Request, res: Response) => {
    const asset = await AssetService.restoreAsset(
      req.user!._id,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Asset restored successfully.",
      data: asset,
    });
  }),
};
