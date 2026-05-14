import express from "express";
import Internship from "../models/Internship.js";
import Application from "../models/Application.js";
import authMiddleware from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// GET all internships
router.get("/", async (req, res) => {
  try {
    const { domain, location, stipend, company } = req.query;  // Added company
    let filter = {};
    if (domain) filter.domain = domain;
    if (location) filter.location = location;
    if (stipend) filter.stipend = stipend;
    if (company) filter.company = company;  // Added company filter

    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === "student") {
          const student = await User.findById(decoded.id).select("cgpa graduationYear");
          if (!student || student.cgpa === null || student.cgpa === undefined || student.graduationYear === null || student.graduationYear === undefined) {
            return res.json([]);
          }
          filter.minCGPA = { $lte: student.cgpa };
          filter.graduationYear = student.graduationYear;
        }
      } catch (err) {
        // ignore token parse errors for public listing
      }
    }

    const internships = await Internship.find(filter);
    res.json(internships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add internship (placement only)
router.post("/", authMiddleware, async (req, res) => {
  console.log('POST /api/internships called');
  console.log('User:', req.user);
  console.log('Body:', req.body);
  try {
    if (req.user.role !== 'placement') {
      console.log('Access denied: user role is', req.user.role);
      return res.status(403).json({ error: 'Access denied' });
    }
    const { role, company, location, stipend, domain, applyLink, minCGPA, graduationYear, lastDateToApply, deadlineNote } = req.body;
    if (minCGPA === undefined || minCGPA === null || Number.isNaN(Number(minCGPA))) {
      return res.status(400).json({ error: "Minimum CGPA is required" });
    }
    if (graduationYear === undefined || graduationYear === null || Number.isNaN(Number(graduationYear))) {
      return res.status(400).json({ error: "Graduation Year is required" });
    }
    console.log('Creating internship:', { role, company, location, stipend, domain, applyLink, minCGPA, graduationYear, lastDateToApply, deadlineNote });
    const internship = new Internship({
      role,
      company,
      location,
      stipend,
      domain,
      applyLink,
      minCGPA: Number(minCGPA),
      graduationYear: Number(graduationYear),
      lastDateToApply: lastDateToApply ? new Date(lastDateToApply) : null,
      deadlineNote: deadlineNote || "",
    });
    await internship.save();
    console.log('Internship saved:', internship);

    // Create notifications for eligible students
    try {
      const eligibleStudents = await User.find({
        role: "student",
        cgpa: { $gte: Number(minCGPA) },
        graduationYear: Number(graduationYear),
      }).select("_id");

      const notificationMessage = lastDateToApply
        ? `New internship available for you at ${company}. Apply before ${new Date(lastDateToApply).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}.`
        : `New internship available for you at ${company}.`;

      for (const student of eligibleStudents) {
        const notification = new Notification({
          userId: student._id,
          type: "internship",
          message: notificationMessage,
          internshipId: internship._id,
          target: `/student/internships?highlightInternshipId=${internship._id}`,
          isRead: false,
        });
        await notification.save();
      }
      console.log(`Created ${eligibleStudents.length} notifications for eligible students`);
    } catch (notifErr) {
      console.error('Error creating notifications:', notifErr);
      // Don't fail the internship creation if notifications fail
    }

    res.status(201).json(internship);
  } catch (err) {
    console.error('Error saving internship:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE internship (placement only) + delete related applications
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "placement") {
      return res.status(403).json({ error: "Access denied" });
    }

    const deletedInternship = await Internship.findByIdAndDelete(req.params.id);
    if (!deletedInternship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    await Application.deleteMany({ internshipId: deletedInternship._id });

    res.json({ message: "Internship and related applications deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;