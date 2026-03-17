import mongoose, { Schema } from "mongoose";

const ShortUrlSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ShortUrlModel = mongoose.model("ShortUrl", ShortUrlSchema);
