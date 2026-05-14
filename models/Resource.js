import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    uploadedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ["student", "placement"], required: true },
    },
    files: [{ type: String }], // Array of file URLs/paths
    images: [{ type: String }], // Array of image URLs/paths
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);