import { Schema, model } from "mongoose";
import { INetWorthHistoryDocument } from "./net-worth-history.interface";

const netWorthHistorySchema = new Schema<INetWorthHistoryDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    total_assets: {
      type: Number,
      default: 0,
    },
    total_liabilities: {
      type: Number,
      default: 0,
    },
    net_worth: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

netWorthHistorySchema.index({ user_id: 1, date: -1 }, { unique: true });

export const NetWorthHistory = model<INetWorthHistoryDocument>(
  "NetWorthHistory",
  netWorthHistorySchema,
);
