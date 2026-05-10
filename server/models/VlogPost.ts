import mongoose, { Schema, Document } from "mongoose";
import type { VlogPost } from "../../shared/schema.js";

export interface VlogPostDocument extends Omit<VlogPost, "id">, Document {}

const vlogPostSchema = new Schema<VlogPostDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    embedUrl: { type: String, required: true },
    embedPlatform: { type: String, required: true },
    thumbnail: { type: String, default: null },
    tags: { type: [String], default: [] },
    category: { type: String, required: true },
    seoTitle: { type: String },
    seoDescription: { type: String },
    published: { type: Boolean, default: false },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    sourceContentId: { type: String },
    campaignId: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const VlogPostModel =
  mongoose.models.VlogPost ||
  mongoose.model<VlogPostDocument>("VlogPost", vlogPostSchema);
