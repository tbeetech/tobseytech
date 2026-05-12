import mongoose, { Schema, Document } from "mongoose";

export interface EmailContact {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  subscribedAt: Date;
  unsubscribed: boolean;
}

export interface EmailListDocument extends Document {
  orgId: string;
  name: string;
  description?: string;
  contacts: EmailContact[];
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<EmailContact>(
  {
    email:        { type: String, required: true, lowercase: true, trim: true },
    firstName:    { type: String },
    lastName:     { type: String },
    tags:         { type: [String], default: [] },
    subscribedAt: { type: Date, default: () => new Date() },
    unsubscribed: { type: Boolean, default: false },
  },
  { _id: false }
);

const emailListSchema = new Schema<EmailListDocument>(
  {
    orgId:        { type: String, required: true, index: true },
    name:         { type: String, required: true, trim: true },
    description:  { type: String },
    contacts:     { type: [contactSchema], default: [] },
    contactCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

// Keep contactCount in sync automatically
emailListSchema.pre("save", function (next) {
  this.contactCount = this.contacts.filter((c) => !c.unsubscribed).length;
  next();
});

export const EmailListModel =
  mongoose.models.EmailList ||
  mongoose.model<EmailListDocument>("EmailList", emailListSchema);
