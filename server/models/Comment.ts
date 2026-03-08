import mongoose, { Schema, Document } from "mongoose";
import type { Comment } from "@shared/schema";

export interface CommentDocument extends Omit<Comment, "id">, Document {}

const commentSchema = new Schema<CommentDocument>(
  {
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt" } }
);

export const CommentModel =
  mongoose.models.Comment || mongoose.model<CommentDocument>("Comment", commentSchema);
