import { Document, Types } from "mongoose";

export enum LiabilityType {
  MORTGAGE = "mortgage",
  LOAN = "loan",
  OTHER = "other",
}

export interface ILiability {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  name: string;
  type: LiabilityType;
  amount: number;
  interest_rate?: number;
  start_date?: Date;
  end_date?: Date;
  notes?: string;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILiabilityDocument extends ILiability, Document {}
