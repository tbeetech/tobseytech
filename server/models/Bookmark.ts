import mongoose, { Schema, Document } from "mongoose";
import type { Bookmark } from "@shared/schema";

export interface BookmarkDocument extends Omit<Bookmark, "id">, Document {}

const bookmarkSchema = new Schema<BookmarkDocument>(
  {
    postId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt" } }
);

bookmarkSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const BookmarkModel =
  mongoose.models.Bookmark || mongoose.model<BookmarkDocument>("Bookmark", bookmarkSchema);
