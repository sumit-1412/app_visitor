import mongoose, { Document, Schema } from "mongoose";

export interface IVisitor extends Document {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  photoUrl?: string;
  ndaUrl?: string;
  site: mongoose.Types.ObjectId;

  status?: "pending-guard" | "checked-in" | "checked-out" | "rejected";
  purpose?: string;
  host?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  approvedBy?: string;
  approvalTime?: Date;
  rejectionReason?: string;

  createdAt?: Date;
  updatedAt?: Date; // ✅ Add this line
}

const VisitorSchema = new Schema<IVisitor>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    company: String,
    photoUrl: String,
    ndaUrl: String,
    site: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },

    status: {
      type: String,
      enum: ["pending-guard", "checked-in", "checked-out", "rejected"],
      default: "pending-guard",
    },
    purpose: String,
    host: String,
    checkInTime: Date,
    checkOutTime: Date,
    approvedBy: String,
    approvalTime: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.model<IVisitor>("Visitor", VisitorSchema);
