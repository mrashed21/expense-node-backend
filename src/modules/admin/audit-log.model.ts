import { Schema, model } from "mongoose";
import { IAuditLogDocument } from "./admin.interface";

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    admin_id: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    action: { type: String, required: true },
    target_id: { type: Schema.Types.Mixed }, // Can be an ObjectId or string depending on the target
    details: { type: Schema.Types.Mixed },
    ip_address: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    // Audit logs should ideally be immutable
  }
);

auditLogSchema.index({ admin_id: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLogDocument>("AuditLog", auditLogSchema);
