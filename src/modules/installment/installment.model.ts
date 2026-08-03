import { Schema, model } from "mongoose";
import { IInstallmentDocument } from "./installment.interface";

const installmentSchema = new Schema<IInstallmentDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    total_amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be positive"],
    },
    paid_amount: {
      type: Number,
      default: 0,
    },
    remaining_amount: {
      type: Number,
      required: true,
    },
    total_months: {
      type: Number,
      required: true,
      min: [1, "Must have at least 1 month"],
    },
    months_paid: {
      type: Number,
      default: 0,
    },
    monthly_amount: {
      type: Number,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    is_completed: {
      type: Boolean,
      default: false,
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

installmentSchema.index({ user_id: 1, is_completed: 1, is_deleted: 1 });

export const Installment = model<IInstallmentDocument>(
  "Installment",
  installmentSchema,
);
