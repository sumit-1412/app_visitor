import mongoose, { Document, Schema } from "mongoose";

export interface ISite extends Document {
  name: string;
  location?: string;
}

const SiteSchema = new Schema<ISite>(
  {
    name: { type: String, required: true },
    location: String,
  },
  { timestamps: true }
);

export default mongoose.model<ISite>("Site", SiteSchema);
