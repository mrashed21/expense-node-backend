import { Types } from "mongoose";
import ApiError from "../../helpers/api-error";
import { publishToAdmins } from "../../utils/ably";
import { IReview } from "./review.interface";
import { Review } from "./review.model";

const createReview = async (
  userId: string,
  payload: Pick<IReview, "rating" | "comment">,
) => {
  const existingReview = await Review.findOne({ user_id: userId });
  if (existingReview) {
    throw new ApiError(400, "You have already submitted a review.");
  }

  const result = await Review.create({
    user_id: new Types.ObjectId(userId),
    rating: payload.rating,
    comment: payload.comment,
  });

  await publishToAdmins("new_review", result);

  return result;
};

const getMyReviews = async (userId: string) => {
  const reviews = await Review.find({ user_id: userId }).sort({
    createdAt: -1,
  });
  return reviews;
};

const deleteReview = async (userId: string, reviewId: string) => {
  const review = await Review.findOneAndDelete({
    _id: reviewId,
    user_id: userId,
  });
  if (!review) {
    throw new ApiError(404, "Review not found or not authorized to delete.");
  }
  return review;
};

const getApprovedReviews = async () => {
  const reviews = await Review.find({ is_approved: true })
    .populate("user_id", "user_name profile_image")
    .sort({ createdAt: -1 });

  return reviews;
};

// ── Admin functions ──────────────────────────────────────────────

const getAdminReviews = async () => {
  const reviews = await Review.find()
    .populate("user_id", "user_name user_email profile_image")
    .sort({ createdAt: -1 });
  return reviews;
};

const approveReview = async (reviewId: string) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { is_approved: true },
    { new: true },
  );
  if (!review) {
    throw new ApiError(404, "Review not found.");
  }
  return review;
};

const rejectReview = async (reviewId: string) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { is_approved: false },
    { new: true },
  );
  if (!review) {
    throw new ApiError(404, "Review not found.");
  }
  return review;
};

const adminDeleteReview = async (reviewId: string) => {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    throw new ApiError(404, "Review not found.");
  }
  return review;
};

export const ReviewService = {
  createReview,
  getMyReviews,
  deleteReview,
  getApprovedReviews,
  getAdminReviews,
  approveReview,
  rejectReview,
  adminDeleteReview,
};
