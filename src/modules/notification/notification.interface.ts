import { Document, Types } from "mongoose";

export interface INotificationDocument extends Document {
  user_id: Types.ObjectId;
  title: string;
  message: string;
  type: "budget_alert" | "bill_reminder" | "goal_milestone" | "system";
  is_read: boolean;
  createdAt: Date;
}
