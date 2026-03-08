import mongoose, { Schema, Document } from "mongoose";
import type { User } from "@shared/schema";

export interface UserDocument extends Omit<User, "id">, Document {}

const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: null },
  },
  { timestamps: { createdAt: "createdAt" } }
);

export const UserModel = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
