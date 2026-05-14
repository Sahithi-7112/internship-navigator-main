import express from 'express';
import Application from '../models/Application.js';

const router = express.Router();

// POST apply to internship
router.post('/apply', async (req, res) => {
  try {
    const { studentId, internshipId } = req.body;
    const application = new Application({ studentId, internshipId });
    await application.save();
    res.json({ message: 'Applied successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET applications for a student
router.get('/:studentId', async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.params.studentId }).populate('internshipId');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;