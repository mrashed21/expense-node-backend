import { Schema, model } from "mongoose";
import { ILoanRepaymentDocument } from "./loan.interface";

const loanRepaymentSchema = new Schema<ILoanRepaymentDocument>(
  {
    loan_id: {
      type: Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Repayment amount is required"],
      min: [0.01, "Repayment amount must be greater than zero"],
    },
    payment_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    payment_method: {
      type: String,
      required: true,
      default: "Cash",
    },
    account_id: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    is_reversed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

loanRepaymentSchema.index({ loan_id: 1, payment_date: -1 });
loanRepaymentSchema.index({ user_id: 1, payment_date: -1 });

export const LoanRepayment = model<ILoanRepaymentDocument>(
  "LoanRepayment",
  loanRepaymentSchema,
);
