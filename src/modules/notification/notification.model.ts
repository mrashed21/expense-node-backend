import { Schema, model } from "mongoose";
import { INotificationDocument } from "./notification.interface";

const notificationSchema = new Schema<INotificationDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["budget_alert", "bill_reminder", "goal_milestone", "system"],
      default: "system",
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ user_id: 1, createdAt: -1 });

export const Notification = model<INotificationDocument>("Notification", notificationSchema);
