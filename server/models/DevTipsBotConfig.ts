import mongoose, { Schema, Document } from "mongoose";
import type { DevTipsBotConfig, DevTipsSocialAccount, DevTipsPillar } from "../../shared/schema.js";
import { DEV_TIPS_PILLARS } from "../../shared/schema.js";

export interface DevTipsBotConfigDocument extends Omit<DevTipsBotConfig, "id">, Document {}

const socialAccountSchema = new Schema<DevTipsSocialAccount>(
  {
    platform:     { type: String, required: true },
    enabled:      { type: Boolean, default: false },
    accessToken:  { type: String, default: null },
    refreshToken: { type: String, default: null },
    accountId:    { type: String, default: null },
    displayName:  { type: String, default: null },
    connectedAt:  { type: Date, default: null },
  },
  { _id: false }
);

const defaultPillarWeights = (): Record<DevTipsPillar, number> =>
  Object.fromEntries(DEV_TIPS_PILLARS.map((p) => [p, 1])) as Record<DevTipsPillar, number>;

const devTipsBotConfigSchema = new Schema<DevTipsBotConfigDocument>(
  {
    running:          { type: Boolean, default: false },
    paused:           { type: Boolean, default: false },
    postIntervalMs:   { type: Number, default: 24 * 60 * 60 * 1000 }, // 24 h
    allowedFormats:   { type: [String], default: ["plain-text", "code-card", "infographic"] },
    defaultPlatforms: { type: [String], default: ["twitter", "linkedin"] },
    pillarWeights:    { type: Map, of: Number, default: defaultPillarWeights },
    socialAccounts:   { type: [socialAccountSchema], default: [] },
    autoPublish:      { type: Boolean, default: false },
    tone:             { type: String, default: "professional" },
    audience:         { type: String, default: "mid-senior engineers" },
    lastPillarIndex:  { type: Number, default: -1 },
    totalGenerated:   { type: Number, default: 0 },
    totalPublished:   { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const DevTipsBotConfigModel =
  mongoose.models.DevTipsBotConfig ||
  mongoose.model<DevTipsBotConfigDocument>("DevTipsBotConfig", devTipsBotConfigSchema);
