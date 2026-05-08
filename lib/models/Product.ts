import { Schema, model, models, Document } from "mongoose";
import mongoose from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  type: "free" | "paid" | "subscription";
  price: number;
  currency: string;
  images: string[];
  videoUrl?: string; // Added for YouTube link
  features: string[];
  techStack: string[];
  badge?: string;
  isFeatured: boolean;
  isActive: boolean;
  downloadUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  razorpayPlanId?: string;
  
  // Category specific fields
  security?: string;
  support?: string;
  onboarding?: string;
  integrations?: string[];
  fileFormats?: string[];
  compatibility?: string;
  techSpecs?: string;
  license?: string;
  blogPost?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true, maxlength: 300 },
    longDescription: { type: String },
    category: { type: String, required: true },
    type: { type: String, enum: ["free", "paid", "subscription"], required: true },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    images: { type: [String], default: [] },
    videoUrl: { type: String },
    features: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    badge: { type: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    downloadUrl: { type: String },
    demoUrl: { type: String },
    docsUrl: { type: String },
    razorpayPlanId: { type: String },
    
    // Category specific
    security: { type: String },
    support: { type: String },
    onboarding: { type: String },
    integrations: { type: [String], default: [] },
    fileFormats: { type: [String], default: [] },
    compatibility: { type: String },
    techSpecs: { type: String },
    license: { type: String },
    blogPost: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
