import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const applicationPath = pathToFileURL(path.resolve(__dirname, "../models/Application.js")).href;
const notificationPath = pathToFileURL(path.resolve(__dirname, "../models/Notification.js")).href;

const { default: Application } = await import(applicationPath);
const { default: Notification } = await import(notificationPath);

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI is not set in the environment.");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB for application migration.");

  // Step 1: Set appliedAt to April 10, 2026 for applications missing it
  const aprilDate = new Date("2026-04-10");
  const appResult = await Application.updateMany(
    {
      $or: [
        { appliedAt: { $exists: false } },
        { appliedAt: null },
      ],
    },
    {
      $set: { appliedAt: aprilDate },
    }
  );

  console.log(`Updated ${appResult.modifiedCount || appResult.nModified || 0} application(s) with appliedAt = April 10, 2026.`);

  // Step 2: Create notifications for existing shortlisted applications
  const shortlistedApps = await Application.find({ status: "Shortlisted" });
  console.log(`Found ${shortlistedApps.length} shortlisted application(s).`);

  let notificationCount = 0;
  for (const app of shortlistedApps) {
    // Check if notification already exists
    const existingNotif = await Notification.findOne({
      userId: app.studentId,
      applicationId: app._id,
      type: "shortlisted",
    });

    if (!existingNotif) {
      const notification = new Notification({
        userId: app.studentId,
        type: "shortlisted",
        message: `You have been shortlisted for ${app.company} - ${app.role}. Check details.`,
        applicationId: app._id,
        target: `/student/applications?highlightApplicationId=${app._id}`,
        isRead: false,
      });
      await notification.save();
      notificationCount++;
    }
  }

  console.log(`Created ${notificationCount} new shortlisted notification(s).`);

  // Step 3: Create notifications for existing selected applications
  const selectedApps = await Application.find({ status: "Selected" });
  console.log(`Found ${selectedApps.length} selected application(s).`);

  let selectedNotificationCount = 0;
  for (const app of selectedApps) {
    const existingNotif = await Notification.findOne({
      userId: app.studentId,
      applicationId: app._id,
      type: "selected",
    });

    if (!existingNotif) {
      const notification = new Notification({
        userId: app.studentId,
        type: "selected",
        message: `🎉 You have been selected for ${app.company} - ${app.role}!`,
        applicationId: app._id,
        target: `/student/applications?highlightApplicationId=${app._id}`,
        isRead: false,
      });
      await notification.save();
      selectedNotificationCount++;
    }
  }

  console.log(`Created ${selectedNotificationCount} new selected notification(s).`);

  console.log("\n✅ Migration completed successfully!");
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
} finally {
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}
