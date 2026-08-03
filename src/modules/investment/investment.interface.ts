import { Document, Types } from "mongoose";

export enum InvestmentType {
  STOCK = "stock",
  CRYPTO = "crypto",
  BOND = "bond",
  MUTUAL_FUND = "mutual_fund",
  OTHER = "other",
}

export interface IInvestment {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  name: string;
  symbol?: string;
  type: InvestmentType;
  quantity: number;
  purchase_price: number;
  current_price: number;
  purchase_date?: Date;
  notes?: string;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInvestmentDocument extends IInvestment, Document {}
