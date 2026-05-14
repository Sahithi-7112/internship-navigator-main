import mongoose from 'mongoose';
import User from './models/User.js';

async function main() {
  try {
    await mongoose.connect('mongodb+srv://sahithigogula_db_user:sahithi@cluster0.biexyvm.mongodb.net/internship_navigator?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    const users = await User.find().sort({ createdAt: -1 }).limit(10);
    
    console.log(`\nFound ${users.length} total users:`);
    
    users.forEach((user) => {
      console.log(`\n- ${user.email} (role: ${user.role})`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Created: ${user.createdAt}`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
