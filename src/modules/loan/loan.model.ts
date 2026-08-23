import { Schema, model } from "mongoose";
import { ILoanDocument, LoanStatus } from "./loan.interface";

const loanSchema = new Schema<ILoanDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    borrower_id: {
      type: Schema.Types.ObjectId,
      ref: "Borrower",
      index: true,
    },
    borrower_name: {
      type: String,
      required: [true, "Borrower name is required"],
      trim: true,
    },
    principal_amount: {
      type: Number,
      required: [true, "Principal amount is required"],
      min: [0.01, "Principal amount must be greater than zero"],
    },
    recovered_amount: {
      type: Number,
      default: 0,
      min: [0, "Recovered amount cannot be negative"],
    },
    outstanding_amount: {
      type: Number,
      required: true,
      min: [0, "Outstanding amount cannot be negative"],
    },
    write_off_amount: {
      type: Number,
      default: 0,
      min: [0, "Write-off amount cannot be negative"],
    },
    write_off_reason: {
      type: String,
      trim: true,
    },
    write_off_date: {
      type: Date,
    },
    source_account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Source account is required"],
      index: true,
    },
    source_account_name: {
      type: String,
      trim: true,
    },
    lent_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expected_return_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.ACTIVE,
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

loanSchema.index({ user_id: 1, is_deleted: 1, lent_date: -1 });
loanSchema.index({ user_id: 1, status: 1, is_deleted: 1 });
loanSchema.index({ user_id: 1, borrower_name: 1 });
loanSchema.index({ user_id: 1, expected_return_date: 1 });

export const Loan = model<ILoanDocument>("Loan", loanSchema);
