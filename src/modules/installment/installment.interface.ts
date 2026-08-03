import { Document, Types } from "mongoose";

export interface IInstallment {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  account_id: Types.ObjectId;
  title: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  total_months: number;
  months_paid: number;
  monthly_amount: number;
  start_date: Date;
  end_date: Date;
  is_completed: boolean;
  notes?: string;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInstallmentDocument extends IInstallment, Document {}
