import { Document, Types } from "mongoose";

export enum DebtType {
  LENT = "lent",
  BORROWED = "borrowed",
}

export enum DebtStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  PAID = "paid",
}

export interface IDebt {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  person_name: string;
  type: DebtType;
  amount: number;
  remaining_amount: number;
  interest_rate?: number;
  due_date?: Date;
  status: DebtStatus;
  notes?: string;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDebtDocument extends IDebt, Document {}
