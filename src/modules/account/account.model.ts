import { Schema, model } from "mongoose";
import { AccountType, IAccountDocument } from "./account.interface";

const accountSchema = new Schema<IAccountDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(AccountType),
      required: true,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    is_credit: {
      type: Boolean,
      default: false,
    },
    opening_balance: {
      type: Number,
      default: 0,
    },
    current_balance: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "#4F46E5",
    },
    icon: {
      type: String,
      default: "Wallet",
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
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

accountSchema.index({ user_id: 1, status: 1, is_deleted: 1 });

export const Account = model<IAccountDocument>("Account", accountSchema);
