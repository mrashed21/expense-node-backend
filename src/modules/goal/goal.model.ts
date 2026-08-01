import { Schema, model } from "mongoose";
import { IGoalDocument } from "./goal.interface";

const goalSchema = new Schema<IGoalDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "Savings Goal",
    },
    target_amount: {
      type: Number,
      required: true,
      min: [1, "Target amount must be greater than zero"],
    },
    current_amount: {
      type: Number,
      default: 0,
    },
    target_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

goalSchema.index({ user_id: 1, status: 1 });

export const Goal = model<IGoalDocument>("Goal", goalSchema);
