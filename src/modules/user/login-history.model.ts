import { Schema, model } from "mongoose";
import { ILoginHistoryDocument } from "./user.interface";

const loginHistorySchema = new Schema<ILoginHistoryDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ip_address: {
      type: String,
      required: true,
    },
    user_agent: {
      type: String,
      required: true,
    },
    device_info: {
      type: String,
      default: "Unknown Device",
    },
    browser: {
      type: String,
      default: "Unknown Browser",
    },
    location: {
      type: String,
      default: "Unknown Location",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

loginHistorySchema.index({ user_id: 1, timestamp: -1 });

export const LoginHistory = model<ILoginHistoryDocument>(
  "LoginHistory",
  loginHistorySchema,
);
