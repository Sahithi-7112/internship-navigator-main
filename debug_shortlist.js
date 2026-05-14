import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Application from './models/Application.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const apps = await Application.find({ status: { $regex: /shortlisted/i } }).limit(50).lean();
  console.log('found:', apps.length);
  apps.forEach((app) => {
    const studentId = app.studentId && typeof app.studentId.toString === 'function'
      ? app.studentId.toString()
      : app.studentId || null;
    const internshipId = app.internshipId && typeof app.internshipId.toString === 'function'
      ? app.internshipId.toString()
      : app.internshipId || null;
    console.log({
      _id: app._id && typeof app._id.toString === 'function' ? app._id.toString() : app._id,
      studentId,
      studentEmail: app.studentEmail,
      company: app.company,
      status: app.status,
      internshipId,
    });
  });

  const user = await User.findOne({ email: 'sahithigogula@gmail.com' }).lean();
  console.log('user:', user ? {
    _id: user._id && typeof user._id.toString === 'function' ? user._id.toString() : user._id,
    email: user.email,
    name: user.name,
    cgpa: user.cgpa,
    graduationYear: user.graduationYear,
    rollNo: user.rollNo,
    department: user.department,
  } : null);

  if (user) {
    const emailRegex = new RegExp(`^${String(user.email).trim().replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, 'i');
    const companyRegex = new RegExp(`^${String('S&P').trim().replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, 'i');
    const matches = await Application.find({
      company: companyRegex,
      $or: [
        { studentEmail: emailRegex },
        { studentId: user._id }
      ]
    }).lean();
    console.log('direct query matches:', matches.length);
    matches.forEach((app) => {
      console.log('match app', app._id && typeof app._id.toString === 'function' ? app._id.toString() : app._id, app.company, app.studentEmail, app.studentId);
    });
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});