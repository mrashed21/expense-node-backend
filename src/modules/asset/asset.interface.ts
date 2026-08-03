import { Document, Types } from "mongoose";

export enum AssetType {
  REAL_ESTATE = "real_estate",
  VEHICLE = "vehicle",
  VALUABLE = "valuable",
  OTHER = "other",
}

export interface IAsset {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  name: string;
  type: AssetType;
  value: number;
  purchase_price?: number;
  purchase_date?: Date;
  notes?: string;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssetDocument extends IAsset, Document {}
