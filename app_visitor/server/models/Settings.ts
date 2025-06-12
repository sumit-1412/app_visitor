import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  site: mongoose.Types.ObjectId;
  enableOtp: boolean;
  enablePhotoCapture: boolean;
  enableConsent: boolean;
  enableQr: boolean;
  enableFaceMatch: boolean;
}

const SettingsSchema = new Schema<ISettings>(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      unique: true,
      required: true,
    },
    enableOtp: { type: Boolean, default: false },
    enablePhotoCapture: { type: Boolean, default: false },
    enableConsent: { type: Boolean, default: false },
    enableQr: { type: Boolean, default: true },
    enableFaceMatch: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>("Settings", SettingsSchema);
