import mongoose, { Schema, Document } from "mongoose";
import type { Contact } from "@shared/schema";

export interface ContactDocument extends Omit<Contact, "id">, Document {}

const contactSchema = new Schema<ContactDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    projectType: { type: String, required: true },
    budgetRange: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "new" },
  },
  { timestamps: { createdAt: "createdAt" } }
);

export const ContactModel =
  mongoose.models.Contact || mongoose.model<ContactDocument>("Contact", contactSchema);
