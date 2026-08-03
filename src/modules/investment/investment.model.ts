import { Schema, model } from "mongoose";
import { IInvestmentDocument, InvestmentType } from "./investment.interface";

const investmentSchema = new Schema<IInvestmentDocument>(
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
    symbol: {
      type: String,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: Object.values(InvestmentType),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
    purchase_price: {
      type: Number,
      required: true,
      min: [0, "Purchase price cannot be negative"],
    },
    current_price: {
      type: Number,
      required: true,
      min: [0, "Current price cannot be negative"],
    },
    purchase_date: {
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

investmentSchema.index({ user_id: 1, type: 1, is_deleted: 1 });

export const Investment = model<IInvestmentDocument>(
  "Investment",
  investmentSchema,
);
