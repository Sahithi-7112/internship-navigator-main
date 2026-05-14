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

    console.log(`\n✅ Found harika: ${harika.email}`);

    // Check her application
    const app = await Application.findOne({ 
      $or: [
        { studentId: harika._id },
        { studentEmail: harika.email }
      ]
    });

    console.log('\n📋 Application Details:');
    if (app) {
      console.log(`   Company: ${app.company}`);
      console.log(`   Role: ${app.role}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Application ID: ${app._id}`);
    } else {
      console.log('   ❌ No application found');
    }

    // Check notifications for harika
    const notifs = await Notification.find({ userId: harika._id }).sort({ createdAt: -1 });
    
    console.log(`\n🔔 Notifications (${notifs.length} total):`);
    if (notifs.length === 0) {
      console.log('   ⚠️ NO NOTIFICATIONS YET');
    } else {
      notifs.forEach((notif, idx) => {
        console.log(`   ${idx + 1}. [${notif.type}] ${notif.message}`);
        console.log(`      - Created: ${notif.createdAt}`);
        console.log(`      - Read: ${notif.isRead ? '✓' : '✗'}`);
      });
    }

    // Check specifically for Accenture shortlist notification
    const accentureNotif = await Notification.findOne({
      userId: harika._id,
      type: 'shortlisted',
      message: { $regex: 'Accenture', $options: 'i' }
    });

    if (accentureNotif) {
      console.log('\n✅ ACCENTURE SHORTLIST NOTIFICATION FOUND!');
      console.log(`   Message: ${accentureNotif.message}`);
    } else {
      console.log('\n❌ Accenture shortlist notification NOT found');
      console.log('   (This is the issue - notification should exist but doesn\'t)');
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
