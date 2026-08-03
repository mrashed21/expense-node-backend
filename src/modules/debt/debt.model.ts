import { Schema, model } from "mongoose";
import { DebtStatus, DebtType, IDebtDocument } from "./debt.interface";

const debtSchema = new Schema<IDebtDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    person_name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(DebtType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be positive"],
    },
    remaining_amount: {
      type: Number,
      required: true,
      min: [0, "Remaining amount cannot be negative"],
    },
    interest_rate: {
      type: Number,
      default: 0,
      min: [0, "Interest rate cannot be negative"],
    },
    due_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(DebtStatus),
      default: DebtStatus.PENDING,
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

debtSchema.index({ user_id: 1, type: 1, is_deleted: 1 });
debtSchema.index({ user_id: 1, due_date: 1 });

export const Debt = model<IDebtDocument>("Debt", debtSchema);
