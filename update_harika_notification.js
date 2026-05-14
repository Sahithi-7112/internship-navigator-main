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

    // Update her notification with target field
    const updatedNotif = await Notification.findOneAndUpdate(
      {
        userId: harika._id,
        type: 'shortlisted'
      },
      {
        $set: {
          target: `/student/applications?highlightApplicationId=${app._id}`
        }
      },
      { new: true }
    );

    if (updatedNotif) {
      console.log('✅ Notification updated with redirect link!');
      console.log(`\nNotification Details:`);
      console.log(`   Student: ${harika.email}`);
      console.log(`   Message: ${updatedNotif.message}`);
      console.log(`   Target: ${updatedNotif.target}`);
      console.log(`   Type: ${updatedNotif.type}`);
    } else {
      console.log('⚠️ Notification not found');
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
