import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  console.log("Register request:", req.body);

  const { email, password, role } = req.body;

  try {
    const user = new User({ email, password, role });
    await user.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update current user profile
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const updates = {
      name: req.body.name ?? "",
      rollNo: req.body.rollNo ?? "",
      department: req.body.department ?? "",
      skills: req.body.skills ?? "",
      projects: req.body.projects ?? "",
      resumeName: req.body.resumeName ?? "",
      resumeFile: req.body.resumeFile ?? "",
      cgpa: req.body.cgpa === "" || req.body.cgpa === null || req.body.cgpa === undefined
        ? null
        : Number(req.body.cgpa),
      graduationYear: req.body.graduationYear === "" || req.body.graduationYear === null || req.body.graduationYear === undefined
        ? null
        : Number(req.body.graduationYear),
    };

    if (updates.cgpa !== null && Number.isNaN(updates.cgpa)) {
      return res.status(400).json({ error: "Invalid CGPA" });
    }

    if (updates.graduationYear !== null && Number.isNaN(updates.graduationYear)) {
      return res.status(400).json({ error: "Invalid Graduation Year" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;