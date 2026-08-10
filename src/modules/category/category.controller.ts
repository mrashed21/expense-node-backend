import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { CategoryService } from "./category.service";

export const CategoryController = {
  getUserCategories: catchAsync(async (req: Request, res: Response) => {
    const categories = await CategoryService.getUserCategories(req.user!._id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: categories,
    });
  }),

  createCategory: catchAsync(async (req: Request, res: Response) => {
    const category = await CategoryService.createCategory(
      req.user!._id,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  }),

  updateCategory: catchAsync(async (req: Request, res: Response) => {
    const updated = await CategoryService.updateCategory(
      req.user as any,
      req.params.id as string,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category updated successfully.",
      data: updated,
    });
  }),

  deleteCategory: catchAsync(async (req: Request, res: Response) => {
    await CategoryService.deleteCategory(
      req.user as any,
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category deleted successfully.",
    });
  }),
};
