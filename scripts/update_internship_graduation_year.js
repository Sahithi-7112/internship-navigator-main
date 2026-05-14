import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const internshipPath = pathToFileURL(path.resolve(__dirname, "../models/Internship.js")).href;
const { default: Internship } = await import(internshipPath);

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI is not set in the environment.");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB for internship migration.");

  const result = await Internship.updateMany(
    {
      $or: [
        { graduationYear: { $exists: false } },
        { graduationYear: null },
      ],
    },
    {
      $set: { graduationYear: 2027 },
    }
  );

  console.log(`Updated ${result.modifiedCount || result.nModified || 0} internship(s) with graduationYear = 2027.`);
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
} finally {
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}
