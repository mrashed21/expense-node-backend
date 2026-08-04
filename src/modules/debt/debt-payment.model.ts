import { Document, Schema, Types, model } from "mongoose";

export interface IDebtPayment {
  _id: Types.ObjectId;
  debt_id: Types.ObjectId;
  user_id: Types.ObjectId;
  amount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDebtPaymentDocument extends IDebtPayment, Document {}

const debtPaymentSchema = new Schema<IDebtPaymentDocument>(
  {
    debt_id: {
      type: Schema.Types.ObjectId,
      ref: "Debt",
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
      required: true,
      min: [0.01, "Payment amount must be greater than zero"],
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
  },
);

debtPaymentSchema.index({ debt_id: 1, date: -1 });

export const DebtPayment = model<IDebtPaymentDocument>("DebtPayment", debtPaymentSchema);
