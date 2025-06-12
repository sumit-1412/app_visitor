import mongoose, { Document, Schema } from "mongoose";

export interface IHost extends Document {
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  site: mongoose.Types.ObjectId;
}

const HostSchema = new Schema<IHost>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    department: String,
    site: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IHost>("Host", HostSchema);
