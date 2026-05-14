import express from "express";
import NocRequest from "../models/NocRequest.js";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// POST /noc-request - Create NOC request
router.post("/noc-request", authMiddleware, async (req, res) => {
  try {
    const { company, offerLetter, nocDocument } = req.body;

    if (!company || !offerLetter) {
      return res.status(400).json({ error: "Company and offer letter are required" });
    }

    const nocRequest = new NocRequest({
      studentId: req.user.id,
      company,
      offerLetter,
      nocDocument: nocDocument || "",
    });

    await nocRequest.save();

    res.status(201).json({ message: "NOC request submitted successfully", nocRequest });
  } catch (err) {
    console.error("NOC request creation error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /noc-requests - Get all NOC requests (for HOD)
router.get("/noc-requests", authMiddleware, async (req, res) => {
  try {
    // Only hod can view all requests
    if (req.user.role !== "hod") {
      return res.status(403).json({ error: "Access denied" });
    }

    const nocRequests = await NocRequest.find()
      .populate("studentId", "name rollNo department email")
      .sort({ createdAt: -1 });

    res.json(nocRequests);
  } catch (err) {
    console.error("Fetch NOC requests error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /noc-request/:id - Update NOC request status
router.put("/noc-request/:id", authMiddleware, async (req, res) => {
  try {
    // Only hod can update requests
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
    ).populate("studentId", "name rollNo department email");

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

// GET /noc-request - Get student's own NOC requests
router.get("/noc-request", authMiddleware, async (req, res) => {
  try {
    const nocRequests = await NocRequest.find({ studentId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(nocRequests);
  } catch (err) {
    console.error("Fetch student NOC requests error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;