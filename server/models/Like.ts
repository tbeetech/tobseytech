import mongoose, { Schema, Document } from "mongoose";
import type { Like } from "../../shared/schema.js";

export interface LikeDocument extends Omit<Like, "id">, Document {}

const likeSchema = new Schema<LikeDocument>(
  {
    postId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt" } }
);

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const LikeModel =
  mongoose.models.Like || mongoose.model<LikeDocument>("Like", likeSchema);
