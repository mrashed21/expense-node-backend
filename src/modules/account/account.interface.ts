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
