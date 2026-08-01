import { Document, Types } from "mongoose";

export enum AccountType {
  CASH = "Cash",
  WALLET = "Wallet",
  BANK = "Bank",
  BKASH = "Bkash",
  NAGAD = "Nagad",
  ROCKET = "Rocket",
  UPAY = "Upay",
  VISA_CARD = "Visa Card",
  MASTER_CARD = "Master Card",
  PAYPAL = "PayPal",
  WISE = "Wise",
  CRYPTO_WALLET = "Crypto Wallet",
  CUSTOM = "Custom",
}

export interface IAccount {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  name: string;
  type: AccountType;
  opening_balance: number;
  current_balance: number;
  color: string;
  icon: string;
  description?: string;
  status: "active" | "archived";
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountDocument extends IAccount, Document {}

export enum CategoryType {
  INCOME = "income",
  EXPENSE = "expense",
}

export interface ICategory {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  parent_id?: Types.ObjectId; // For subcategories
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document {}

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
