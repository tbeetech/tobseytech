import mongoose, { Schema, Document } from "mongoose";
import type { Course } from "@shared/schema";

export interface CourseDocument extends Omit<Course, "id">, Document {}

const courseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    duration: { type: String, required: true },
    level: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, default: null },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "createdAt" } }
);

export const CourseModel =
  mongoose.models.Course || mongoose.model<CourseDocument>("Course", courseSchema);
