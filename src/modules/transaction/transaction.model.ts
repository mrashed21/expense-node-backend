import { Schema, model } from "mongoose";
import { ITransactionDocument, TransactionType } from "./transaction.interface";

const transactionSchema = new Schema<ITransactionDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    subcategory_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0, "Amount must be positive"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    time: {
      type: String,
    },
    payment_method: {
      type: String,
      default: "Cash",
    },
    notes: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    attachment_url: {
      type: String,
    },
    reference_number: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    is_recurring: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.index({ user_id: 1, date: -1, type: 1, is_deleted: 1 });
transactionSchema.index({ user_id: 1, account_id: 1, date: -1 });

export const Transaction = model<ITransactionDocument>("Transaction", transactionSchema);
