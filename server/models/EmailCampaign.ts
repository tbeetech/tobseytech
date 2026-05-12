import mongoose, { Schema, Document } from "mongoose";

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled";

export interface EmailCampaignDocument extends Document {
  orgId: string;
  listId: string;
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  htmlBody: string;
  textBody?: string;
  status: CampaignStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  // Tracking stats (atomic $inc updates)
  totalSent: number;
  totalOpens: number;
  uniqueOpens: number;
  totalClicks: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
  // A/B testing (Pro+)
  abTestEnabled: boolean;
  abSubjectB?: string;
  abWinnerPickedAt?: Date;
  // Custom cron (Enterprise)
  customCronExpr?: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailCampaignSchema = new Schema<EmailCampaignDocument>(
  {
    orgId:           { type: String, required: true, index: true },
    listId:          { type: String, required: true },
    subject:         { type: String, required: true, trim: true },
    previewText:     { type: String },
    fromName:        { type: String, required: true, trim: true },
    fromEmail:       { type: String, required: true, trim: true, lowercase: true },
    htmlBody:        { type: String, required: true },
    textBody:        { type: String },
    status:          {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "paused", "cancelled"],
      default: "draft",
    },
    scheduledAt:     { type: Date },
    sentAt:          { type: Date },
    totalSent:       { type: Number, default: 0 },
    totalOpens:      { type: Number, default: 0 },
    uniqueOpens:     { type: Number, default: 0 },
    totalClicks:     { type: Number, default: 0 },
    uniqueClicks:    { type: Number, default: 0 },
    bounces:         { type: Number, default: 0 },
    unsubscribes:    { type: Number, default: 0 },
    abTestEnabled:   { type: Boolean, default: false },
    abSubjectB:      { type: String },
    abWinnerPickedAt:{ type: Date },
    customCronExpr:  { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

// Compound index for cron dispatch queries
emailCampaignSchema.index({ status: 1, scheduledAt: 1, orgId: 1 });

export const EmailCampaignModel =
  mongoose.models.EmailCampaign ||
  mongoose.model<EmailCampaignDocument>("EmailCampaign", emailCampaignSchema);
