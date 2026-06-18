import mongoose from 'mongoose';
import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('Seed: ADMIN_EMAIL or ADMIN_PASSWORD environment variables not set. Skipping admin account seeding.');
      return;
    }

    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      // Create new admin
      await User.create({
        username: 'admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      console.log(`Seed: Admin account (${adminEmail}) successfully seeded.`);
    } else {
      // Ensure existing admin account is verified
      let updated = false;
      if (!admin.isVerified) {
        admin.isVerified = true;
        updated = true;
      }
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        updated = true;
      }
      if (updated) {
        await admin.save();
        console.log(`Seed: Existing admin account (${adminEmail}) updated to verified admin.`);
      } else {
        console.log(`Seed: Admin account (${adminEmail}) already exists. Seeding skipped.`);
      }
    }
  } catch (error) {
    console.error(`Admin seeding failed: ${error.message}`);
  }
};

const connectDB = async () => {
  const primaryURI = process.env.MONGO_URI;
  const fallbackURI = 'mongodb://127.0.0.1:27017/nqtcoder';

  if (primaryURI) {
    try {
      console.log('Attempting primary database connection (Atlas)...');
      // Set serverSelectionTimeoutMS to 3000ms (3s) to detect offline states quickly
      const conn = await mongoose.connect(primaryURI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`MongoDB Connected (Primary): ${conn.connection.host}`);
      await seedAdmin();
      return;
    } catch (error) {
      console.warn(`Primary Database connection failed (${error.message}). Trying fallback local database...`);
    }
  }

  try {
    console.log('Connecting to local fallback database...');
    const conn = await mongoose.connect(fallbackURI);
    console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    await seedAdmin();
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
