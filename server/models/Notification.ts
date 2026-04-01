import mongoose, { Schema, Document } from "mongoose";
import type { Notification, NotificationType } from "../../shared/schema.js";
import { NOTIFICATION_TYPES } from "../../shared/schema.js";

export interface NotificationDocument extends Omit<Notification, "id">, Document {}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
    actorId: { type: String, default: null },
    actorName: { type: String, default: null },
    entityId: { type: String, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", notificationSchema);
