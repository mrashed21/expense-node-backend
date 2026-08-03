import { Document, Types } from "mongoose";

export interface INetWorthHistory {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  date: Date;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface INetWorthHistoryDocument extends INetWorthHistory, Document {}
