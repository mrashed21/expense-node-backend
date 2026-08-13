import { model, Schema } from "mongoose";
import { IFeedback } from "./feedback.interface";

const feedbackSchema = new Schema<IFeedback>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },
    admin_reply: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Feedback = model<IFeedback>("Feedback", feedbackSchema);
