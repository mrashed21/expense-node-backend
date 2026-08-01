import { Document, Types } from "mongoose";

export interface IBudgetDocument extends Document {
  user_id: Types.ObjectId;
  category_id: Types.ObjectId;
  amount: number;
  period: "monthly" | "yearly";
  month_year: string;
  warning_threshold: number;
  createdAt: Date;
  updatedAt: Date;
}
