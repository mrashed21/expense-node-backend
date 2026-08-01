import { Schema, model } from "mongoose";
import { ITransferDocument } from "../interfaces/financial.interface";

const transferSchema = new Schema<ITransferDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    from_account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    to_account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    fee: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transferSchema.index({ user_id: 1, date: -1 });

export const Transfer = model<ITransferDocument>("Transfer", transferSchema);
