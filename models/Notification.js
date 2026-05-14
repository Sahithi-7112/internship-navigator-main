import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["internship", "shortlisted", "selected", "noc"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      default: null,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    target: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
