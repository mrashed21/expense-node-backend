import { Schema, model, Document, Types } from "mongoose";

export interface IGoalDocument extends Document {
  user_id: Types.ObjectId;
  title: string;
  category: string; // Savings Goal, Emergency Fund, Vacation, Car, House, Laptop, Custom
  target_amount: number;
  current_amount: number;
  target_date?: Date;
  status: "active" | "completed" | "paused";
  createdAt: Date;
  updatedAt: Date;
}

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
