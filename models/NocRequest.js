import mongoose from "mongoose";

const nocRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    offerLetter: {
      type: String,
      required: true,
    },
    nocDocument: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    hodRemarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("NocRequest", nocRequestSchema);