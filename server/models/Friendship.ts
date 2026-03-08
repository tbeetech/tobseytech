import mongoose, { Schema, Document } from "mongoose";
import type { Friendship } from "@shared/schema";

export interface FriendshipDocument extends Omit<Friendship, "id">, Document {}

const friendshipSchema = new Schema<FriendshipDocument>(
  {
    requesterId: { type: String, required: true },
    addresseeId: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: { createdAt: "createdAt" } }
);

friendshipSchema.index({ requesterId: 1, addresseeId: 1 }, { unique: true });

export const FriendshipModel =
  mongoose.models.Friendship ||
  mongoose.model<FriendshipDocument>("Friendship", friendshipSchema);
