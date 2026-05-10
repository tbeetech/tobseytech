import mongoose, { Schema, Document } from "mongoose";
import type { AuditLog } from "../../shared/schema.js";

export interface AuditLogDocument extends Omit<AuditLog, "id">, Document {}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    targetId: { type: String },
    targetType: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

// TTL index: automatically purge logs older than 180 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export const AuditLogModel =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema);
