// File: /server/index.ts
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Import route modules (ES-style)
import authRoutes from "./routes/auth";
import visitorRoutes from "./routes/visitors";
import visitRoutes from "./routes/visits";
import hostRoutes from "./routes/hosts";
import siteRoutes from "./routes/sites";
import settingsRoutes from "./routes/settings";
import uploadRoutes from "./routes/upload";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/hosts", hostRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
