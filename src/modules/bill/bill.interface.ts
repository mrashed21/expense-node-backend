import { Document, Types } from "mongoose";

export interface IBillDocument extends Document {
  user_id: Types.ObjectId;
  title: string;
  type: string;
  amount: number;
  due_date: Date;
  status: "unpaid" | "paid" | "overdue";
  auto_reminder: boolean;
  createdAt: Date;
  updatedAt: Date;
}
