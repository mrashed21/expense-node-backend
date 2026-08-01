import { Document, Types } from "mongoose";

export interface ITransfer {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  from_account_id: Types.ObjectId;
  to_account_id: Types.ObjectId;
  amount: number;
  fee: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransferDocument extends ITransfer, Document {}
