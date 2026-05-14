import express from 'express';
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POST apply to internship
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { internshipId } = req.body;
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    if (
      !student ||
      !student.name ||
      student.cgpa === null ||
      student.cgpa === undefined ||
      Number.isNaN(Number(student.cgpa)) ||
      student.graduationYear === null ||
      student.graduationYear === undefined ||
      Number.isNaN(Number(student.graduationYear))
    ) {
      return res.status(400).json({ error: 'Please complete your profile before applying' });
    }

    console.log('req.body:', req.body);
    console.log('Applying for internshipId:', internshipId, 'by studentId:', studentId);

    // Check if already applied
    const existing = await Application.findOne({ studentId, internshipId });
    if (existing) {
      return res.status(400).json({ error: 'Already applied to this internship' });
    }

    // Get internship details
    const internship = await Internship.findById(internshipId);
    console.log('Found internship:', internship);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    if (Number(student.cgpa) < Number(internship.minCGPA)) {
      return res.status(400).json({ error: 'You are not eligible for this internship' });
    }

    const application = new Application({
      studentId,
      studentEmail: req.user.email,
      internshipId,
      company: internship.company,
      role: internship.role,
    });
    await application.save();
    res.json({ message: 'Applied successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all applications (placement only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'placement') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const applications = await Application.find()
      .populate('studentId', 'email name rollNo department')
      .populate('internshipId');

    const normalized = applications
      .filter((app) => app.internshipId !== null)
      .map((app) => {
      const obj = app.toObject();
      if (!obj.status) {
        obj.status = 'Applied';
      }
      return obj;
    });

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST bulk shortlist by employer
router.post('/shortlist-bulk', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { company, students } = req.body || {};

    if (!company || typeof company !== 'string') {
      return res.status(400).json({ error: 'Company is required' });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Students array is required' });
    }

    const results = [];

    for (const student of students) {
      if (!student || !student.email) continue;

      const email = String(student.email).trim().toLowerCase();
      if (!email) continue;

      const status = ['Applied', 'Shortlisted', 'Selected'].includes(student.status)
        ? student.status
        : 'Shortlisted';
      const note = typeof student.note === 'string' ? student.note.trim() : '';

      // Find the student user to get their ID (case-insensitive search)
      const studentUser = await User.findOne({ 
        email: { $regex: `^${email}$`, $options: 'i' } 
      });
      if (!studentUser) {
        console.log(`Student not found for email: ${email}`);
        results.push({
          email,
          status,
          matchedApplications: 0,
          error: 'Student not found in system',
        });
        continue;
      }

      // Update all applications for this student and company (case-insensitive match)
      const companyRegex = new RegExp(`^${escapeRegExp(company.trim())}$`, 'i');
      const emailRegex = new RegExp(`^${escapeRegExp(email)}$`, 'i');
      let updateResult = await Application.updateMany(
        {
          company: companyRegex,
          $or: [
            { studentEmail: emailRegex },
            { studentId: studentUser._id }
          ]
        },
        {
          status,
          note,
        }
      );

      if (updateResult.matchedCount === 0) {
        const possibleApps = await Application.find({
          $or: [
            { studentEmail: emailRegex },
            { studentId: studentUser._id }
          ]
        });

        console.log(`Possible applications for ${email}: ${possibleApps.length}`);

        if (possibleApps.length === 1) {
          const fallbackResult = await Application.updateOne(
            { _id: possibleApps[0]._id },
            { status, note }
          );
          updateResult = fallbackResult;
          console.log(`Fallback update for ${email}: matched=${fallbackResult.matchedCount}, modified=${fallbackResult.modifiedCount}`);
        } else {
          console.log(`No exact company match for ${email} and ${possibleApps.length} student app(s) available.`);
        }
      }

      console.log(`Update result for ${email}: matched=${updateResult.matchedCount}, modified=${updateResult.modifiedCount}`);

      // Create notification for shortlisted/selected students when we found matching records
      // (whether newly updated or already in that state)
      if (updateResult.matchedCount > 0 && ['Shortlisted', 'Selected'].includes(status)) {
        // Get the application to include in notification
        const app = await Application.findOne({
          company: companyRegex,
          $or: [
            { studentEmail: emailRegex },
            { studentId: studentUser._id }
          ]
        });

        const message = status === 'Selected'
          ? `You have been selected for ${company} - ${app?.role || 'position'}!`
          : `You have been shortlisted for ${company} - ${app?.role || 'position'}. Check details.`;

        // Only create notification if one doesn't already exist for this app in last hour
        const recentNotif = await Notification.findOne({
          userId: studentUser._id,
          applicationId: app?._id,
          type: status === 'Selected' ? 'selected' : 'shortlisted',
          createdAt: { $gte: new Date(Date.now() - 3600000) } // Last hour
        });

        if (!recentNotif) {
          await Notification.create({
            userId: studentUser._id,
            applicationId: app?._id,
            type: status === 'Selected' ? 'selected' : 'shortlisted',
            message,
            target: `/student/applications?highlightApplicationId=${app?._id}`,
          });
        }
      }

      const alreadyUpdated = updateResult.matchedCount > 0 && updateResult.modifiedCount === 0;
      results.push({
        email,
        status,
        matchedApplications: updateResult.matchedCount || 0,
        modifiedApplications: updateResult.modifiedCount || 0,
        alreadyUpdated,
      });
    }

    return res.json({
      message: 'Bulk shortlist processed',
      company,
      results,
    });
  } catch (err) {
    console.error('Error in /shortlist-bulk:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET student profile (placement only)
router.get('/student-profile/:id', authMiddleware, async (req, res) => {
  try {
    console.log('User role:', req.user.role);
    console.log('Requested student ID:', req.params.id);

    if (req.user.role !== 'placement') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const student = await User.findById(req.params.id).select('name email rollNo department skills projects cgpa graduationYear resumeName resumeFile');
    console.log('Found student:', student ? 'Yes' : 'No');
    if (student) {
      console.log('Student data:', { name: student.name, email: student.email, rollNo: student.rollNo, department: student.department });
    }

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error('Error in student-profile route:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET applications for current student
router.get('/student', authMiddleware, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (
      !student ||
      !student.name ||
      student.cgpa === null ||
      student.cgpa === undefined ||
      Number.isNaN(Number(student.cgpa)) ||
      student.graduationYear === null ||
      student.graduationYear === undefined ||
      Number.isNaN(Number(student.graduationYear))
    ) {
      return res.json([]);
    }

    const applications = await Application.find({
      $or: [
        { studentId: req.user.id },
        { studentEmail: req.user.email },
      ],
    }).populate('internshipId');

    const normalized = applications
      .filter((app) => app.internshipId !== null)
      .map((app) => {
      const obj = app.toObject();
      if (!obj.status) {
        obj.status = 'Applied';
      }
      return obj;
    });

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update application status (for placement/employer)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (!['placement', 'employer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { status, note } = req.body;
    if (!['Applied', 'Shortlisted', 'Selected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    application.note = typeof note === 'string' ? note : '';
    await application.save();

    const updatedApplication = await Application.findById(req.params.id);
    res.json(updatedApplication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;