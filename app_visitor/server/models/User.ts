// File: /server/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: "admin" | "superadmin" | "guard";
  assignedSites: mongoose.Types.ObjectId[];
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["admin", "superadmin", "guard"],
      default: "admin",
    },
    assignedSites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Site" }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
