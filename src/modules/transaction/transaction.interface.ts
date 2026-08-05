import { Document, Types } from "mongoose";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  REFUND = "refund",
  ADJUSTMENT = "adjustment",
  OPENING_BALANCE = "opening_balance",
}

export interface ITransaction {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  account_id: Types.ObjectId;
  category_id?: Types.ObjectId;
  subcategory_id?: Types.ObjectId;
  type: TransactionType;
  amount: number;
  foreign_currency?: string;
  foreign_amount?: number;
  exchange_rate?: number;
  splits?: Array<{
    category_id: Types.ObjectId;
    amount: number;
    notes?: string;
  }>;
  is_installment?: boolean;
  installment_id?: Types.ObjectId;
  date: Date;
  time?: string;
  payment_method?: string;
  notes?: string;
  location?: string;
  attachment_url?: string;
  reference_number?: string;
  tags?: string[];
  is_recurring?: boolean;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionDocument extends ITransaction, Document {}
