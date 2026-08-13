import { Types } from "mongoose";

export interface IFeedback {
  user_id: Types.ObjectId;
  subject: string;
  message: string;
  status: "pending" | "reviewed";
  admin_reply?: string;
}
