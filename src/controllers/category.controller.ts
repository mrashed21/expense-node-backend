import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { CategoryService } from "../services/category.service";
import { sendResponse } from "../helpers/send-response";

export const CategoryController = {
  getUserCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await CategoryService.getUserCategories(req.user!._id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await CategoryService.createCategory(req.user!._id, req.body);
      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Category created successfully.",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  updateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await CategoryService.updateCategory(req.user!._id, req.params.id, req.body);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category updated successfully.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CategoryService.deleteCategory(req.user!._id, req.params.id);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
