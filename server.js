import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import internshipRoutes from "./routes/internships.js";
import applicationRoutes from "./routes/applications.js";
import notificationRoutes from "./routes/notifications.js";
import recommendationRoutes from "./routes/recommendations.js";
import resourceRoutes from "./routes/resources.js";
import nocRoutes from "./routes/noc.js";
import hodRoutes from "./routes/hod.js";

// Load .env.backend if running as server, otherwise .env
import fs from "fs";
if (fs.existsSync(".env.backend")) {
  dotenv.config({ path: ".env.backend" });
} else {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS — allow deployed frontend OR localhost in dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://internship-navigator-main.vercel.app", // hardcoded Vercel URL
  "http://localhost:8081",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    callback(null, false); // reject cleanly without throwing
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files using absolute path (required on Render)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api", nocRoutes);
app.use("/api/hod", hodRoutes);

// Health check
app.get("/", (req, res) => res.send("Internship Navigator API is running."));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));