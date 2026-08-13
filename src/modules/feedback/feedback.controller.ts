import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import sendResponse from "../../utils/send-response";
import { FeedbackService } from "./feedback.service";

const createFeedback = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await FeedbackService.createFeedback(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Feedback submitted successfully",
    data: result,
  });
});

const getMyFeedbacks = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const result = await FeedbackService.getMyFeedbacks(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedbacks fetched successfully",
    data: result,
  });
});

const deleteFeedback = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const { id } = req.params;
  const result = await FeedbackService.deleteFeedback(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback deleted successfully",
    data: result,
  });
});

const getAdminFeedbacks = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedbackService.getAdminFeedbacks();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedbacks fetched successfully",
    data: result,
  });
});

const markAsReviewed = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FeedbackService.markAsReviewed(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Feedback marked as reviewed",
    data: result,
  });
});

const replyToFeedback = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { admin_reply } = req.body;
  const result = await FeedbackService.replyToFeedback(id, admin_reply);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reply sent successfully",
    data: result,
  });
});

export const FeedbackController = {
  createFeedback,
  getMyFeedbacks,
  deleteFeedback,
  getAdminFeedbacks,
  markAsReviewed,
  replyToFeedback,
};
