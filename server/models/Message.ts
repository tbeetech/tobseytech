import mongoose, { Schema, Document } from "mongoose";
import type { Message } from "../../shared/schema.js";

export interface MessageDocument extends Omit<Message, "id">, Document {}

const messageSchema = new Schema<MessageDocument>(
  {
    senderId: { type: String, required: true },
    recipientId: { type: String, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    replyToId: { type: String, default: null },
  },
  { timestamps: { createdAt: "createdAt" } }
);

messageSchema.index({ senderId: 1, recipientId: 1 });

export const MessageModel =
  mongoose.models.Message || mongoose.model<MessageDocument>("Message", messageSchema);
