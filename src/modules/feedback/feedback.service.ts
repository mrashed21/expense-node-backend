import { Types } from "mongoose";
import ApiError from "../../helpers/api-error";
import { Feedback } from "./feedback.model";
import { IFeedback } from "./feedback.interface";
import { publishToAdmins } from "../../utils/ably";
import { createAndEmitNotification } from "../notification/notification.helper";

const createFeedback = async (userId: string, payload: Pick<IFeedback, "subject" | "message">) => {
  const result = await Feedback.create({
    user_id: new Types.ObjectId(userId),
    subject: payload.subject,
    message: payload.message,
  });

  // Emit real-time event to admin dashboard
  await publishToAdmins("new_feedback", result);

  return result;
};

const getMyFeedbacks = async (userId: string) => {
  const feedbacks = await Feedback.find({ user_id: userId }).sort({ createdAt: -1 });
  return feedbacks;
};

const deleteFeedback = async (userId: string, feedbackId: string) => {
  const feedback = await Feedback.findOneAndDelete({ _id: feedbackId, user_id: userId });
  if (!feedback) {
    throw new ApiError(404, "Feedback not found or not authorized to delete.");
  }
  return feedback;
};

const getAdminFeedbacks = async () => {
  const feedbacks = await Feedback.find()
    .populate("user_id", "user_name user_email profile_image")
    .sort({ createdAt: -1 });

  return feedbacks;
};

const markAsReviewed = async (feedbackId: string) => {
  const feedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    { status: "reviewed" },
    { new: true }
  );
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }
  return feedback;
};

const replyToFeedback = async (feedbackId: string, replyMessage: string) => {
  const feedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    { status: "reviewed", admin_reply: replyMessage },
    { new: true }
  );
  
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  // Notify the user
  await createAndEmitNotification(feedback.user_id.toString(), {
    title: "Response to your feedback",
    message: replyMessage,
    type: "info",
  });

  return feedback;
};

export const FeedbackService = {
  createFeedback,
  getMyFeedbacks,
  deleteFeedback,
  getAdminFeedbacks,
  markAsReviewed,
  replyToFeedback,
};
