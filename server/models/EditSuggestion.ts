import mongoose, { Schema, Document } from "mongoose";
import type { EditSuggestion } from "@shared/schema";

export interface EditSuggestionDocument extends Omit<EditSuggestion, "id">, Document {}

const editSuggestionSchema = new Schema<EditSuggestionDocument>(
  {
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    suggestedTitle: { type: String },
    suggestedContent: { type: String },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: { createdAt: "createdAt" } }
);

export const EditSuggestionModel =
  mongoose.models.EditSuggestion ||
  mongoose.model<EditSuggestionDocument>("EditSuggestion", editSuggestionSchema);
