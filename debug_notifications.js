import mongoose from 'mongoose';
import Notification from './models/Notification.js';
import User from './models/User.js';
import Application from './models/Application.js';

async function main() {
  try {
    await mongoose.connect('mongodb+srv://sahithigogula_db_user:sahithi@cluster0.biexyvm.mongodb.net/internship_navigator?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Get all students
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5);
    
    console.log(`\nFound ${students.length} students:`);
    
    for (const student of students) {
      console.log(`\n--- ${student.email} ---`);
      console.log('User ID:', student._id);
      
      // Check applications
      const apps = await Application.find({
        $or: [{ studentId: student._id }, { studentEmail: student.email }]
      }).sort({ createdAt: -1 });
      
      console.log(`Applications: ${apps.length}`);
      apps.forEach(app => {
        console.log(`  - ${app.company} (${app.role}): ${app.status} [created: ${app.createdAt}]`);
      });
      
      // Check notifications
      const notifs = await Notification.find({ userId: student._id }).sort({ createdAt: -1 });
      
      console.log(`Notifications: ${notifs.length}`);
      if (notifs.length === 0) {
        console.log('  ⚠️ NO NOTIFICATIONS');
      } else {
        notifs.forEach(notif => {
          console.log(`  - [${notif.type}] ${notif.message} [${notif.createdAt}]`);
        });
      }
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
