import mongoose, { Schema, Document } from "mongoose";
import type { SportaContent } from "../../shared/schema.js";

export interface SportaContentDocument extends Omit<SportaContent, "id">, Document {}

const sportaContentSchema = new Schema<SportaContentDocument>(
  {
    campaignId: { type: String, required: true, index: true },
    sourceUrl: { type: String, required: true },
    sourcePlatform: { type: String, required: true },
    originalTitle: { type: String },
    originalContent: { type: String },
    originalAuthor: { type: String },
    originalThumbnail: { type: String, default: null },
    mediaType: { type: String, required: true },
    embedCode: { type: String },
    aiRewrittenTitle: { type: String },
    aiRewrittenContent: { type: String },
    aiGeneratedHashtags: { type: [String], default: [] },
    aiQualityScore: { type: Number },
    aiViralScore: { type: Number },
    aiEngagementPrediction: { type: Number },
    aiConfidenceScore: { type: Number },
    status: { type: String, default: "pending", index: true },
    publishedAt: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const SportaContentModel =
  mongoose.models.SportaContent ||
  mongoose.model<SportaContentDocument>("SportaContent", sportaContentSchema);
