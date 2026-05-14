import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await User.updateMany(
      {
        $or: [
          { rollNo: { $exists: false } },
          { department: { $exists: false } },
          { rollNo: null },
          { department: null },
        ],
      },
      {
        $set: {
          rollNo: "",
          department: "",
        },
      }
    );

    console.log(`Matched ${result.matchedCount} users, modified ${result.modifiedCount} users.`);
  } catch (err) {
    console.error("Failed to update user fields:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

run();
