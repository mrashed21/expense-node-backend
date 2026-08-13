import { Request, Response } from "express";
import catchAsync from "../../helpers/catch-async";
import { sendResponse } from "../../helpers/send-response";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  const result = await ReviewService.getMyReviews(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id as string;
  const id = req.params.id as string;
  const result = await ReviewService.deleteReview(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

const getApprovedReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getApprovedReviews();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getMyReviews,
  deleteReview,
  getApprovedReviews,
};
