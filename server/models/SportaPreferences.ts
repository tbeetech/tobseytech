import mongoose, { Schema, Document } from "mongoose";
import type { SportaPreferences } from "../../shared/schema.js";

export interface SportaPreferencesDocument extends Omit<SportaPreferences, "id">, Document {}

const sportaPreferencesSchema = new Schema<SportaPreferencesDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    defaultTone: { type: String, default: "professional" },
    defaultAudience: { type: String, default: "general" },
    preferShortCaptions: { type: Boolean, default: false },
    preferViralContent: { type: Boolean, default: false },
    preferEducationalContent: { type: Boolean, default: false },
    avoidPolitics: { type: Boolean, default: false },
    preferredLanguages: { type: [String], default: ["English"] },
    preferredHashtags: { type: [String], default: [] },
    preferredCta: { type: String, default: "Learn More" },
    preferredPostingHours: { type: [Number], default: [9, 12, 17, 20] },
    preserveOriginalMeaning: { type: Boolean, default: true },
    rewritingAggressiveness: { type: Number, default: 5 },
    generateEmojis: { type: Boolean, default: true },
    seoOptimize: { type: Boolean, default: true },
    humanizeContent: { type: Boolean, default: true },
    preferredAudienceAge: { type: String, default: "18-35" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const SportaPreferencesModel =
  mongoose.models.SportaPreferences ||
  mongoose.model<SportaPreferencesDocument>("SportaPreferences", sportaPreferencesSchema);
