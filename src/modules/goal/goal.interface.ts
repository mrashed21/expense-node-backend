import { Document, Types } from "mongoose";

export interface IGoalDocument extends Document {
  user_id: Types.ObjectId;
  title: string;
  category: string;
  target_amount: number;
  current_amount: number;
  target_date?: Date;
  status: "active" | "completed" | "paused";
  createdAt: Date;
  updatedAt: Date;
}
