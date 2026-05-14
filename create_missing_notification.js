import mongoose from 'mongoose';
import Notification from './models/Notification.js';
import User from './models/User.js';
import Application from './models/Application.js';

async function main() {
  try {
    await mongoose.connect('mongodb+srv://sahithigogula_db_user:sahithi@cluster0.biexyvm.mongodb.net/internship_navigator?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Get harika
    const harika = await User.findOne({ email: 'harika@gmail.com' });
    
    if (!harika) {
      console.log('❌ harika@gmail.com not found');
      await mongoose.connection.close();
      return;
    }

    // Get her shortlisted application
    const app = await Application.findOne({ 
      $or: [
        { studentId: harika._id },
        { studentEmail: harika.email }
      ],
      status: 'Shortlisted'
    });

    if (!app) {
      console.log('❌ No shortlisted application found for harika');
      await mongoose.connection.close();
      return;
    }

    // Check if notification already exists
    const existingNotif = await Notification.findOne({
      userId: harika._id,
      applicationId: app._id,
      type: 'shortlisted'
    });

    if (existingNotif) {
      console.log('✅ Notification already exists for this application');
      await mongoose.connection.close();
      return;
    }

    // Create the missing notification
    const notif = await Notification.create({
      userId: harika._id,
      applicationId: app._id,
      type: 'shortlisted',
      message: `You have been shortlisted for ${app.company} - ${app.role}. Check details.`,
      target: `/student/applications?highlightApplicationId=${app._id}`,
      isRead: false
    });

    console.log('✅✅✅ NOTIFICATION CREATED SUCCESSFULLY!');
    console.log('\nNotification Details:');
    console.log(`   Student: ${harika.email}`);
    console.log(`   Company: ${app.company}`);
    console.log(`   Role: ${app.role}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Type: ${notif.type}`);
    console.log(`   Created: ${notif.createdAt}`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
