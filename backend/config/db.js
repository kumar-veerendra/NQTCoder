import mongoose from 'mongoose';
import User from '../models/User.js';
import { seedQuestions } from './seedQuestions.js';

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
        role: 'admin'
      });
      console.log(`Seed: Admin account (${adminEmail}) successfully seeded.`);
    } else {
      console.log(`Seed: Admin account (${adminEmail}) already exists. Seeding skipped.`);
    }
  } catch (error) {
    console.error(`Admin seeding failed: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nqtcoder');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default admin account
    await seedAdmin();

    // Seed TCS NQT Practice Questions
    await seedQuestions();
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
