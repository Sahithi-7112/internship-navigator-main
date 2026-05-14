import express from "express";
import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import { parse } from "csv-parse/sync";
import authMiddleware from "../middleware/auth.js";
import Internship from "../models/Internship.js";
import User from "../models/User.js";
import { fileURLToPath } from "url";

const router = express.Router();
const PYTHON_RAG_URL = process.env.PYTHON_RAG_URL || "http://127.0.0.1:8001";
const upload = multer({ storage: multer.memoryStorage() });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_CSV_PATH = path.join(__dirname, "..", "internship_roles_skills_clean_600.csv");

const loadKnowledgeBase = async () => {
  const csvContent = await fs.readFile(KB_CSV_PATH, "utf8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records
    .filter((r) => r.role && r.skills)
    .map((r) => ({ role: String(r.role), skills: String(r.skills) }));
};

const getStudentAndEligibility = async (userId) => {
  const student = await User.findById(userId).select("name email cgpa skills projects");
  if (!student || student.cgpa === null || student.cgpa === undefined || !student.name) {
    return { error: "Please complete your profile before viewing recommendations" };
  }
  const eligibleInternships = await Internship.find({
    minCGPA: { $lte: student.cgpa },
  });
  return { student, eligibleInternships };
};

const callRagAndBuildResponse = async ({ resumeText, eligibleInternships }) => {
  const internshipKB = await loadKnowledgeBase();
  const ragRes = await fetch(`${PYTHON_RAG_URL}/recommend-internships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_text: resumeText,
      internship_kb: internshipKB,
      top_k: 3,
    }),
  });

  if (!ragRes.ok) {
    const text = await ragRes.text();
    throw new Error(`RAG service error: ${text}`);
  }

  const ragData = await ragRes.json();
  const recommendedRoles = Array.isArray(ragData.recommendations) ? ragData.recommendations : [];
  const roleNames = recommendedRoles.map((r) => String(r.role || "")).filter(Boolean);

  const roleInternships = eligibleInternships.filter((item) => {
    if (!item.role) return false;
    return roleNames.some((role) =>
      item.role.toLowerCase().includes(role.toLowerCase()) ||
      role.toLowerCase().includes(item.role.toLowerCase())
    );
  });

  return {
    roles: recommendedRoles,
    internships: roleInternships,
  };
};

router.get("/student", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Access denied" });
    }
    return res.json({
      roles: [],
      internships: [],
      message: "Upload resume to get recommendations",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to load recommendations" });
  }
});

router.post("/student/upload-resume", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload a resume PDF file" });
    }

    const result = await getStudentAndEligibility(req.user.id);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const { eligibleInternships } = result;
    if (!eligibleInternships.length) {
      return res.json({ roles: [], internships: [] });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const parsedPdf = await parser.getText();
    await parser.destroy();
    const resumeText = String(parsedPdf?.text || "").trim();
    if (!resumeText) {
      return res.status(400).json({ error: "Could not extract text from uploaded resume" });
    }

    const response = await callRagAndBuildResponse({ resumeText, eligibleInternships });
    return res.json(response);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to process resume upload" });
  }
});

export default router;

