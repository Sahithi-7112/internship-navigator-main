import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import Resource from "../models/Resource.js";
import authMiddleware from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "..", "uploads");
const resourcesDir = path.join(uploadsDir, "resources");

try {
  await fs.access(resourcesDir);
} catch {
  await fs.mkdir(resourcesDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, resourcesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Files
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
    "application/vnd.ms-excel", // XLS
    "text/plain",
    "application/rtf", // RTF
    "application/octet-stream", // Generic binary (for some file types)
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  console.log(`File upload attempt: ${file.originalname}, MIME type: ${file.mimetype}`);

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log(`Rejected file type: ${file.mimetype} for file: ${file.originalname}`);
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: PDF, DOC, DOCX, XLSX, XLS, TXT, RTF, and image files (JPG, PNG, GIF, WEBP, BMP)`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// GET all resources (students and placement only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "employer") {
      return res.status(403).json({ error: "Access denied" });
    }

    const resources = await Resource.find().sort({ createdAt: -1 });

    // If user is placement, enrich student uploader info with rollNo and department
    if (req.user.role === "placement") {
      for (let resource of resources) {
        if (resource.uploadedBy.role === "student") {
          const student = await User.findById(resource.uploadedBy.userId).select("rollNo department");
          if (student) {
            resource.uploadedBy.rollNo = student.rollNo || "";
            resource.uploadedBy.department = student.department || "";
          }
        }
      }
    }

    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create resource (students and placement only)
router.post("/", authMiddleware, upload.fields([
  { name: "files", maxCount: 10 },
  { name: "images", maxCount: 10 }
]), async (req, res) => {
  try {
    if (req.user.role === "employer") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { title, description, company, role } = req.body;

    // Validation: at least one field must be present
    const hasContent = title || description || (req.files?.files?.length > 0) || (req.files?.images?.length > 0);
    if (!hasContent) {
      return res.status(400).json({ error: "At least one field (title, description, file, or image) is required" });
    }

    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Process uploaded files
    const files = req.files?.files?.map(file => `/uploads/resources/${file.filename}`) || [];
    const images = req.files?.images?.map(file => `/uploads/resources/${file.filename}`) || [];

    const resource = new Resource({
      title: title || "",
      description: description || "",
      company: company || "",
      role: role || "",
      uploadedBy: {
        userId: req.user.id,
        name: user.role === "placement" ? "Placement Cell" : (user.name?.trim() ? user.name.trim() : (user.email || "Unknown User")),
        role: user.role,
      },
      files,
      images,
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE resource (only by uploader or placement)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "employer") {
      return res.status(403).json({ error: "Access denied" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Check if user can delete (only uploader or placement can delete)
    const canDelete = req.user.id === resource.uploadedBy.userId.toString() || req.user.role === "placement";
    if (!canDelete) {
      return res.status(403).json({ error: "You can only delete your own resources" });
    }

    // Delete associated files
    const allFiles = [...resource.files, ...resource.images];
    for (const filePath of allFiles) {
      try {
        const fullPath = path.join(__dirname, "..", "uploads", filePath);
        await fs.unlink(fullPath);
      } catch (err) {
        console.log(`Failed to delete file ${filePath}:`, err.message);
      }
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;