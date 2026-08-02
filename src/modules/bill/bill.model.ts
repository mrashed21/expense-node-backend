import { Schema, model } from "mongoose";
import { IBillDocument } from "./bill.interface";

const billSchema = new Schema<IBillDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Bill title is required"],
      trim: true,
    },
    type: {
      type: String,
      default: "Electricity",
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero"],
    },
    due_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["unpaid", "paid", "overdue"],
      default: "unpaid",
    },
    auto_reminder: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

billSchema.index({ user_id: 1, due_date: 1, status: 1 });

export const Bill = model<IBillDocument>("Bill", billSchema);
