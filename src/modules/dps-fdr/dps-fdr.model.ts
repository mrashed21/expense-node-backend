import { Schema, model } from "mongoose";
import { DepositStatus, DepositType, IDpsFdrDocument } from "./dps-fdr.interface";

const dpsFdrSchema = new Schema<IDpsFdrDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    account_id: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(DepositType), required: true },
    principal_amount: { type: Number, required: true, min: 0 },
    monthly_installment: { type: Number, min: 0 },
    paid_installments: { type: Number, default: 0, min: 0 },
    total_paid: { type: Number, default: 0, min: 0 },
    interest_rate: { type: Number, required: true, min: 0 },
    start_date: { type: Date, required: true },
    maturity_date: { type: Date, required: true },
    maturity_amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(DepositStatus), default: DepositStatus.ACTIVE },
    is_deleted: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false },
);

dpsFdrSchema.index({ user_id: 1, type: 1, status: 1, is_deleted: 1 });

export const DpsFdr = model<IDpsFdrDocument>("DpsFdr", dpsFdrSchema);
