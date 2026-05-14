import express from "express";
import NocRequest from "../models/NocRequest.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// GET /hod/noc-requests - Get all NOC requests for HOD
router.get("/noc-requests", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ error: "Access denied" });
    }

    const nocRequests = await NocRequest.find()
      .populate("studentId", "name rollNo department")
      .sort({ createdAt: -1 });

    res.json(nocRequests);
  } catch (err) {
    console.error("Fetch NOC requests error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /hod/noc-request/:id - Update NOC request status by HOD
router.put("/noc-request/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { status, hodRemarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const nocRequest = await NocRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        hodRemarks: hodRemarks || "",
      },
      { new: true }
    ).populate("studentId", "name rollNo department");

    if (!nocRequest) {
      return res.status(404).json({ error: "NOC request not found" });
    }

    // Create notification for student
    let message = "";
    if (status === "approved") {
      message = "Your NOC request has been approved";
    } else if (status === "rejected") {
      message = hodRemarks
        ? `Your NOC request was rejected. Remarks: ${hodRemarks}`
        : "Your NOC request was rejected";
    }

    const notification = new Notification({
      userId: nocRequest.studentId._id,
      type: "noc",
      message,
      // No target for NOC notifications - they should not be clickable
    });

    await notification.save();

    res.json({ message: "NOC request updated successfully", nocRequest });
  } catch (err) {
    console.error("Update NOC request error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /hod/shortlisted-students - Get shortlisted/selected students for HOD
router.get("/shortlisted-students", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ error: "Access denied" });
    }

    const applications = await Application.find({
      status: { $in: ["Shortlisted", "Selected"] }
    })
      .populate("studentId", "name rollNo department")
      .sort({ appliedAt: -1 });

    const result = applications.map(app => ({
      studentName: app.studentId.name,
      rollNo: app.studentId.rollNo,
      department: app.studentId.department,
      company: app.company,
      role: app.role,
      status: app.status,
    }));

    res.json(result);
  } catch (err) {
    console.error("Fetch shortlisted students error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;