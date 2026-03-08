import mongoose, { Schema, Document } from "mongoose";
import type { BlogPost } from "@shared/schema";

export interface BlogPostDocument extends Omit<BlogPost, "id">, Document {}

const blogPostSchema = new Schema<BlogPostDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: null },
    tags: { type: [String], default: [] },
    category: { type: String, required: true },
    published: { type: Boolean, default: false },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const BlogPostModel =
  mongoose.models.BlogPost || mongoose.model<BlogPostDocument>("BlogPost", blogPostSchema);
