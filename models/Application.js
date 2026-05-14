import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentEmail: String,
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  company: String,
  role: String,

  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Selected'],
    default: "Applied",
  },
  note: {
    type: String,
    default: "",
  },

  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Application", ApplicationSchema);