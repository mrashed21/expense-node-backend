import { Document, Types } from "mongoose";

export enum CategoryType {
  INCOME = "income",
  EXPENSE = "expense",
}

export interface ICategory {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  parent_id?: Types.ObjectId;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_tax_deductible?: boolean;
  is_default: boolean;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document {}
