import express from "express";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";
import Internship from "../models/Internship.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// GET student notifications
router.get("/student", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get persistent notifications and populate internship data
    const notifications = await Notification.find({ userId: req.user.id })
      .populate("internshipId", "role company lastDateToApply deadlineNote")
      .populate("applicationId", "company role note")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT mark notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT mark all notifications as read
router.put("/mark-all/read", authMiddleware, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ modifiedCount: result.modifiedCount || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

