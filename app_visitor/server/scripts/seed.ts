import mongoose from "mongoose";
import dotenv from "dotenv";
import Site from "../models/Site";
import Host from "../models/Host";
import User from "../models/User";
import Visitor from "../models/Visitor";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("✅ Connected to MongoDB");

  // Clear collections
  await Site.deleteMany();
  await Host.deleteMany();
  await User.deleteMany();
  await Visitor.deleteMany();

  // Seed sites
  const site1 = await Site.create({
    name: "Main Office",
    location: "New Delhi",
  });
  const site2 = await Site.create({
    name: "Branch Office",
    location: "Bangalore",
  });

  // Seed hosts
  const host1 = await Host.create({
    name: "Dr. Asha Mehra",
    email: "asha@company.com",
    phone: "9876543210",
    department: "Operations",
    site: site1._id,
  });

  const host2 = await Host.create({
    name: "Mr. Rajiv Menon",
    email: "rajiv@company.com",
    phone: "9876501234",
    department: "Security",
    site: site2._id,
  });

  // Seed users
  await new User({
    name: "Super Admin",
    email: "superadmin@visittrack.com",
    password: "super123",
    role: "superadmin",
    assignedSites: [site1._id, site2._id],
  }).save();

  await new User({
    name: "Site Admin",
    email: "admin@visittrack.com",
    password: "admin123",
    role: "admin",
    assignedSites: [site1._id],
  }).save();

  await new User({
    name: "Security Guard",
    email: "guard@visittrack.com",
    password: "guard123",
    role: "guard",
    assignedSites: [site1._id],
  }).save();

  // ✅ Seed Visitor Logs
  await Visitor.create({
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Inc",
    host: host1.name,
    checkInTime: new Date(Date.now() - 120 * 60000).toISOString(),
    checkOutTime: null,
    status: "checked-in",
    purpose: "Meeting",
    photo: "/placeholder.svg?height=40&width=40&query=JS",
    site: site1._id, // ✅ Required field for validation
    visitDate: new Date().toISOString().split("T")[0],
    approvedBy: "Security Guard",
    approvalTime: new Date(Date.now() - 125 * 60000).toISOString(),
  });

  console.log(
    "✅ Seeded Superadmin, Admin, Guard, Sites, Hosts & Visitor Logs"
  );
  process.exit();
}

seed().catch((err) => {
  console.error("❌ Seeding error:", err);
  process.exit(1);
});
