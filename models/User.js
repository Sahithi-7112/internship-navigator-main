import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["student", "employer", "placement", "hod"], 
    required: true 
  },
  name: { type: String, default: "" },
  rollNo: { type: String, default: "" },
  department: { type: String, default: "" },
  skills: { type: String, default: "" },
  projects: { type: String, default: "" },
  cgpa: { type: Number, default: null },
  graduationYear: { type: Number, default: null },
  resumeName: { type: String, default: "" },
  resumeFile: { type: String, default: "" },
});

// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);