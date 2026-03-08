import mongoose, { Schema, Document } from "mongoose";
import type { Product } from "@shared/schema";

export interface ProductDocument extends Omit<Product, "id">, Document {}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true },
    imageUrl: { type: String, default: null },
    features: { type: [String], default: [] },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "createdAt" } }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<ProductDocument>("Product", productSchema);
