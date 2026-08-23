import { Document, Types } from "mongoose";

export enum LoanStatus {
  ACTIVE = "ACTIVE",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
  WRITTEN_OFF = "WRITTEN_OFF",
}

export interface IBorrower {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBorrowerDocument extends IBorrower, Document {}

export interface ILoan {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  borrower_id?: Types.ObjectId;
  borrower_name: string;
  principal_amount: number;
  recovered_amount: number;
  outstanding_amount: number;
  write_off_amount?: number;
  write_off_reason?: string;
  write_off_date?: Date;
  source_account_id: Types.ObjectId;
  source_account_name?: string;
  lent_date: Date;
  expected_return_date?: Date;
  status: LoanStatus;
  notes?: string;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanDocument extends ILoan, Document {}

export interface ILoanRepayment {
  _id: Types.ObjectId;
  loan_id: Types.ObjectId;
  user_id: Types.ObjectId;
  amount: number;
  payment_date: Date;
  payment_method: string;
  account_id: Types.ObjectId;
  notes?: string;
  is_reversed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanRepaymentDocument extends ILoanRepayment, Document {}
