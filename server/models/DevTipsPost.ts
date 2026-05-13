import mongoose, { Schema, Document } from "mongoose";
import type { DevTipsPost } from "../../shared/schema.js";

export interface DevTipsPostDocument extends Omit<DevTipsPost, "id">, Document {}

const devTipsPostSchema = new Schema<DevTipsPostDocument>(
  {
    pillar:             { type: String, required: true },
    format:             { type: String, required: true },
    title:              { type: String, required: true },
    caption:            { type: String, required: true },
    thread:             { type: [String], default: [] },
    hashtags:           { type: [String], default: [] },
    svgCard:            { type: String, default: null },
    htmlCard:           { type: String, default: null },
    status:             { type: String, required: true, default: "pending" },
    platforms:          { type: [String], default: [] },
    publishedPlatforms: { type: [String], default: [] },
    scheduledAt:        { type: Date, default: null },
    publishedAt:        { type: Date, default: null },
    errorLog:           { type: String, default: null },
    generatedBy:        { type: String, required: true, default: "devtips-bot" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

devTipsPostSchema.index({ status: 1, createdAt: -1 });
devTipsPostSchema.index({ pillar: 1, createdAt: -1 });

export const DevTipsPostModel =
  mongoose.models.DevTipsPost ||
  mongoose.model<DevTipsPostDocument>("DevTipsPost", devTipsPostSchema);
