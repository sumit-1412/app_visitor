// File: /server/models/Visit.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IVisit extends Document {
  visitorId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  hostId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  purpose: string;
  status: "pending-guard" | "checked-in" | "rejected";
  approvedBy?: mongoose.Types.ObjectId;
  approvalNote?: string;
  checkinType: "walk-in" | "pre-registered";
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema: Schema = new Schema(
  {
    visitorId: { type: Schema.Types.ObjectId, ref: "Visitor", required: true },
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    hostId: { type: Schema.Types.ObjectId, ref: "Host" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    purpose: { type: String },
    status: {
      type: String,
      enum: ["pending-guard", "checked-in", "rejected"],
      default: "pending-guard",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvalNote: { type: String },
    checkinType: {
      type: String,
      enum: ["walk-in", "pre-registered"],
      default: "walk-in",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVisit>("Visit", VisitSchema);
