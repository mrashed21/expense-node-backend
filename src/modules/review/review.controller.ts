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

// ── Admin controllers ─────────────────────────────────────────────

const getAdminReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAdminReviews();
  sendResponse(res, { statusCode: 200, success: true, message: "All reviews fetched", data: result });
});

const approveReview = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await ReviewService.approveReview(id);
  sendResponse(res, { statusCode: 200, success: true, message: "Review approved", data: result });
});

const rejectReview = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await ReviewService.rejectReview(id);
  sendResponse(res, { statusCode: 200, success: true, message: "Review rejected", data: result });
});

const adminDeleteReview = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await ReviewService.adminDeleteReview(id);
  sendResponse(res, { statusCode: 200, success: true, message: "Review deleted by admin", data: result });
});

export const ReviewController = {
  createReview,
  getMyReviews,
  deleteReview,
  getApprovedReviews,
  getAdminReviews,
  approveReview,
  rejectReview,
  adminDeleteReview,
};

