import { Document, Types } from "mongoose";

export enum DepositType {
  DPS = "dps",
  FDR = "fdr",
}

export enum DepositStatus {
  ACTIVE = "active",
  MATURED = "matured",
  CLOSED = "closed",
}

export interface IDpsFdrDocument extends Document {
  user_id: Types.ObjectId;
  account_id: Types.ObjectId;
  name: string;
  type: DepositType;
  principal_amount: number;
  monthly_installment?: number;
  paid_installments: number;
  total_paid: number;
  interest_rate: number;
  start_date: Date;
  maturity_date: Date;
  maturity_amount: number;
  status: DepositStatus;
  is_deleted: boolean;
  notes?: string;
}
