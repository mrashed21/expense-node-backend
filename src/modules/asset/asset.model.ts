import { Schema, model } from "mongoose";
import { AssetType, IAssetDocument } from "./asset.interface";

const assetSchema = new Schema<IAssetDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(AssetType),
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: [0, "Value cannot be negative"],
    },
    purchase_price: {
      type: Number,
    },
    purchase_date: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

assetSchema.index({ user_id: 1, type: 1, is_deleted: 1 });

export const Asset = model<IAssetDocument>("Asset", assetSchema);
