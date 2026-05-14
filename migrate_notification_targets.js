import mongoose from 'mongoose';
import Notification from './models/Notification.js';
import Application from './models/Application.js';

async function main() {
  try {
    await mongoose.connect('mongodb+srv://sahithigogula_db_user:sahithi@cluster0.biexyvm.mongodb.net/internship_navigator?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Find all shortlisted and selected notifications without target
    const notificationsToUpdate = await Notification.find({
      type: { $in: ['shortlisted', 'selected'] },
      $or: [
        { target: null },
        { target: { $exists: false } }
      ]
    });

    console.log(`\nFound ${notificationsToUpdate.length} notifications without target field\n`);

    let updated = 0;
    let errors = 0;

    for (const notif of notificationsToUpdate) {
      try {
        // Get the application to extract the ID
        let appId = notif.applicationId;
        
        if (!appId) {
          // Try to find application by userId (fallback)
          const app = await Application.findOne({
            studentId: notif.userId,
            status: { $in: ['Shortlisted', 'Selected'] }
          });
          appId = app?._id;
        }

        if (appId) {
          // Update with target
          await Notification.updateOne(
            { _id: notif._id },
            { $set: { target: `/student/applications?highlightApplicationId=${appId}` } }
          );
          updated++;
          console.log(`✅ Updated notification for application ${appId}`);
        } else {
          console.log(`⚠️  Skipped notification ${notif._id} - no application found`);
        }
      } catch (err) {
        errors++;
        console.error(`❌ Error updating notification ${notif._id}:`, err.message);
      }
    }

    console.log(`\n✅ Migration Complete!`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Errors: ${errors}`);

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
