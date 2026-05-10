import mongoose, { Schema, Document } from "mongoose";
import type { SportaCampaign } from "../../shared/schema.js";

export interface SportaCampaignDocument extends Omit<SportaCampaign, "id">, Document {}

const sportaCampaignSchema = new Schema<SportaCampaignDocument>(
  {
    name: { type: String, required: true },
    industry: { type: String, required: true },
    contentTypes: { type: [String], default: [] },
    sourcePlatforms: { type: [String], default: [] },
    publishingDestinations: { type: [String], default: [] },
    aiMode: { type: String, required: true },
    approvalMode: { type: String, required: true, default: "manual" },
    timelinePreference: { type: String, required: true },
    postingFrequency: { type: String, required: true },
    keywords: { type: [String], default: [] },
    bannedKeywords: { type: [String], default: [] },
    hashtags: { type: [String], default: [] },
    languages: { type: [String], default: ["English"] },
    tone: { type: String, default: "professional" },
    audience: { type: String, default: "general" },
    enableSeo: { type: Boolean, default: true },
    enableViral: { type: Boolean, default: false },
    enableNsfwFilter: { type: Boolean, default: true },
    enableDuplicateFilter: { type: Boolean, default: true },
    minEngagement: { type: Number, default: 0 },
    status: { type: String, default: "draft" },
    creatorId: { type: String, required: true },
    postsAggregated: { type: Number, default: 0 },
    postsPublished: { type: Number, default: 0 },
    postsRejected: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const SportaCampaignModel =
  mongoose.models.SportaCampaign ||
  mongoose.model<SportaCampaignDocument>("SportaCampaign", sportaCampaignSchema);
