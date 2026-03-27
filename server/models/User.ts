/**
 * User model — written from scratch.
 *
 * Stores registered users.  Passwords are always stored pre-hashed with
 * bcryptjs (cost factor 12) — never in plain text.
 */

import mongoose, { Schema, type Document } from "mongoose";
import type { User } from "@shared/schema";

/** Mongoose document interface for a User record. */
export interface UserDocument
  extends Omit<User, "id" | "createdAt">,
    Document {
  /** Password-reset token (hex string, null when unused). */
  resetToken:       string | null;
  /** Token expiry timestamp. */
  resetTokenExpiry: Date   | null;
}

const userSchema = new Schema<UserDocument>(
  {
    username:         { type: String, required: true, unique: true,  trim: true },
    email:            { type: String, required: true, unique: true,  trim: true, lowercase: true },
    password:         { type: String, required: true },
    role:             { type: String, enum: ["user", "admin"], default: "user" },
    displayName:      { type: String, default: "" },
    bio:              { type: String, default: "" },
    avatarUrl:        { type: String, default: null },
    resetToken:       { type: String, default: null },
    resetTokenExpiry: { type: Date,   default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

// Ensure fast look-up by email and by username (already indexed via unique: true).
// An explicit index on email (case-folded) is already enforced by lowercase:true + unique:true.

export const UserModel: mongoose.Model<UserDocument> =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", userSchema);
