import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    role: String,
    company: String,
    location: String,
    stipend: String,
    domain: String,
    applyLink: String,
    minCGPA: {
      type: Number,
      required: true,
    },
    graduationYear: {
      type: Number,
      required: true,
    },
    lastDateToApply: {
      type: Date,
      default: null,
    },
    deadlineNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Internship", internshipSchema);