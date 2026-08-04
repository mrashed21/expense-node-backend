import mongoose, { Schema, Document } from "mongoose";

export enum RecurringType {
  TRANSACTION = "transaction",
  BILL = "bill",
  TRANSFER = "transfer",
}

export enum RecurringFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum RecurringStatus {
  ACTIVE = "active",
  PAUSED = "paused",
}

export interface IRecurring extends Document {
  user_id: mongoose.Types.ObjectId;
  title: string;
  type: RecurringType;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  next_run_date: Date;
  last_run_date?: Date;
  // The exact payload required to spawn the real record
  template: any; 
  created_at: Date;
  updated_at: Date;
}

const RecurringSchema = new Schema<IRecurring>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: Object.values(RecurringType), required: true },
    frequency: { type: String, enum: Object.values(RecurringFrequency), required: true },
    status: { type: String, enum: Object.values(RecurringStatus), default: RecurringStatus.ACTIVE },
    next_run_date: { type: Date, required: true },
    last_run_date: { type: Date },
    template: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

RecurringSchema.index({ user_id: 1, status: 1 });
RecurringSchema.index({ next_run_date: 1, status: 1 }); // Essential for cron worker

export const Recurring = mongoose.model<IRecurring>("Recurring", RecurringSchema);
