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
      default: "system",
    },
    category: {
      type: String,
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
  },
);

notificationSchema.index({ user_id: 1, createdAt: -1 });
// Auto-expire notifications after 90 days to prevent unbounded growth
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 },
);

export const Notification = model<INotificationDocument>(
  "Notification",
  notificationSchema,
);
