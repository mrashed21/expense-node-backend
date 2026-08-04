import { Document, Schema, Types, model } from "mongoose";

export interface IInstallmentPayment {
  _id: Types.ObjectId;
  installment_id: Types.ObjectId;
  user_id: Types.ObjectId;
  amount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInstallmentPaymentDocument extends IInstallmentPayment, Document {}

const installmentPaymentSchema = new Schema<IInstallmentPaymentDocument>(
  {
    installment_id: {
      type: Schema.Types.ObjectId,
      ref: "Installment",
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

installmentPaymentSchema.index({ installment_id: 1, date: -1 });

export const InstallmentPayment = model<IInstallmentPaymentDocument>(
  "InstallmentPayment",
  installmentPaymentSchema,
);
