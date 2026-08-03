import { Document, Types } from "mongoose";

export interface ISavedFilter {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  name: string;
  type: "transaction" | "account" | "category";
  filter_payload: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISavedFilterDocument extends ISavedFilter, Document {}
