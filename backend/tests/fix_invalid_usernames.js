import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';

const runMigration = async () => {
  console.log('🔄 Starting Invalid Username Migration...');

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 2. Fetch all users
    const users = await User.find({});
    console.log(`🔍 Found ${users.length} total users in database.`);

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    let fixedCount = 0;

    for (const user of users) {
      const currentUsername = user.username;

      // Check if username is invalid
      if (!usernameRegex.test(currentUsername)) {
        console.log(`⚠️ Invalid Username detected: "${currentUsername}"`);

        // Generate a clean username:
        // Convert to lowercase, replace spaces/invalid chars with underscores
        let cleanUsername = currentUsername
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, '_') // Replace invalid chars & spaces with '_'
          .replace(/^_+|_+$/g, '');       // Trim leading/trailing underscores

        // Fallback if empty after cleaning
        if (!cleanUsername) {
          cleanUsername = 'user';
        }

        // Enforce length limit (3 to 20 characters)
        if (cleanUsername.length < 3) {
          cleanUsername = cleanUsername.padEnd(3, '0');
        } else if (cleanUsername.length > 20) {
          cleanUsername = cleanUsername.substring(0, 20);
        }

        // Ensure uniqueness
        let uniqueUsername = cleanUsername;
        let counter = 1;

        while (await User.findOne({ username: uniqueUsername, _id: { $ne: user._id } })) {
          const suffix = counter.toString();
          const maxBaseLen = 20 - suffix.length;
          uniqueUsername = `${cleanUsername.substring(0, maxBaseLen)}${suffix}`;
          counter++;
        }

        // Save new username
        user.username = uniqueUsername;
        await user.save();

        console.log(`   └─ Updated username: "${currentUsername}" ➡️ "${uniqueUsername}"`);
        fixedCount++;
      }
    }

    console.log(`\n🎉 Migration complete. Fixed ${fixedCount} users.`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

runMigration();
