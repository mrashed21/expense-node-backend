import { Schema, model } from "mongoose";
import { ILiabilityDocument, LiabilityType } from "./liability.interface";

const liabilitySchema = new Schema<ILiabilityDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(LiabilityType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    interest_rate: {
      type: Number,
      default: 0,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

liabilitySchema.index({ user_id: 1, type: 1, is_deleted: 1 });

export const Liability = model<ILiabilityDocument>(
  "Liability",
  liabilitySchema,
);
