import { Schema, model } from "mongoose";
import { IBudgetDocument } from "./budget.interface";

const budgetSchema = new Schema<IBudgetDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Budget amount must be positive"],
    },
    period: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    month_year: {
      type: String,
      required: true,
    },
    warning_threshold: {
      type: Number,
      enum: [50, 75, 80, 90, 100],
      default: 80,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

budgetSchema.index(
  { user_id: 1, month_year: 1, category_id: 1 },
  { unique: true },
);

export const Budget = model<IBudgetDocument>("Budget", budgetSchema);
