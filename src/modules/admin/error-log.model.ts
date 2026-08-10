import { Schema, model } from "mongoose";
import { IErrorLogDocument } from "./admin.interface";

const errorLogSchema = new Schema<IErrorLogDocument>(
  {
    path: { type: String, required: true },
    method: { type: String, required: true },
    message: { type: String, required: true },
    stack: { type: String },
    user_id: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  },
);
errorLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 },
);
errorLogSchema.index({ path: 1 });

export const ErrorLog = model<IErrorLogDocument>("ErrorLog", errorLogSchema);
