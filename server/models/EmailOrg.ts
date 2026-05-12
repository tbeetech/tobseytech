import mongoose, { Schema, Document } from "mongoose";

export type EmailOrgTier = "starter" | "pro" | "enterprise";
export type OnboardingStatus = "pending" | "org_created" | "tier_selected" | "list_created" | "campaign_created" | "complete";

export interface EmailOrgDocument extends Document {
  userId: string;
  orgName: string;
  orgDomain: string;
  tier: EmailOrgTier;
  onboardingStatus: OnboardingStatus;
  // Usage counters (reset monthly)
  contactsCount: number;
  emailsSentThisMonth: number;
  activeCampaignsCount: number;
  // Tier limits (denormalized for quick access)
  maxContacts: number;
  maxEmailsPerMonth: number;
  maxActiveCampaigns: number;
  // Optional SES config (Pro+)
  sesRegion?: string;
  sesFromEmail?: string;
  // Billing metadata
  billingCycleStart?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TIER_LIMITS: Record<EmailOrgTier, { maxContacts: number; maxEmailsPerMonth: number; maxActiveCampaigns: number }> = {
  starter:    { maxContacts: 500,        maxEmailsPerMonth: 1_000,      maxActiveCampaigns: 1  },
  pro:        { maxContacts: 10_000,     maxEmailsPerMonth: 50_000,     maxActiveCampaigns: 10 },
  enterprise: { maxContacts: 999_999_99, maxEmailsPerMonth: 999_999_99, maxActiveCampaigns: 999 },
};

export { TIER_LIMITS };

const emailOrgSchema = new Schema<EmailOrgDocument>(
  {
    userId:               { type: String, required: true, unique: true, index: true },
    orgName:              { type: String, required: true, trim: true },
    orgDomain:            { type: String, required: true, trim: true },
    tier:                 { type: String, enum: ["starter", "pro", "enterprise"], default: "starter" },
    onboardingStatus:     {
      type: String,
      enum: ["pending", "org_created", "tier_selected", "list_created", "campaign_created", "complete"],
      default: "pending",
    },
    contactsCount:        { type: Number, default: 0 },
    emailsSentThisMonth:  { type: Number, default: 0 },
    activeCampaignsCount: { type: Number, default: 0 },
    maxContacts:          { type: Number, default: TIER_LIMITS.starter.maxContacts },
    maxEmailsPerMonth:    { type: Number, default: TIER_LIMITS.starter.maxEmailsPerMonth },
    maxActiveCampaigns:   { type: Number, default: TIER_LIMITS.starter.maxActiveCampaigns },
    sesRegion:            { type: String },
    sesFromEmail:         { type: String },
    billingCycleStart:    { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const EmailOrgModel =
  mongoose.models.EmailOrg ||
  mongoose.model<EmailOrgDocument>("EmailOrg", emailOrgSchema);
