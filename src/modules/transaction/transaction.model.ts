import { Schema, model } from "mongoose";
import { ITransactionDocument, TransactionType } from "./transaction.interface";

const transactionSchema = new Schema<ITransactionDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
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
    foreign_currency: {
      type: String,
    },
    foreign_amount: {
      type: Number,
    },
    exchange_rate: {
      type: Number,
      default: 1,
    },
    splits: [
      {
        category_id: { type: Schema.Types.ObjectId, ref: "Category" },
        amount: { type: Number },
        notes: { type: String },
        _id: false,
      },
    ],
    is_installment: {
      type: Boolean,
      default: false,
    },
    installment_id: {
      type: Schema.Types.ObjectId,
      ref: "Installment",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
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
  },
);

transactionSchema.index({ user_id: 1, date: -1, type: 1, is_deleted: 1 });
transactionSchema.index({ user_id: 1, account_id: 1, date: -1 });
transactionSchema.index({ user_id: 1, category_id: 1, date: -1 });
transactionSchema.index({ user_id: 1, date: -1, createdAt: -1 }); // Pagination
transactionSchema.index({ notes: "text", location: "text", reference_number: "text", tags: "text" }); // Search

export const Transaction = model<ITransactionDocument>(
  "Transaction",
  transactionSchema,
);
