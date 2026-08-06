import { Document, Types } from "mongoose";

export interface INotificationDocument extends Document {
  user_id: Types.ObjectId;
  title: string;
  message: string;
  type: string;
  category?: string;
  is_read: boolean;
  createdAt: Date;
}
