import mongoose from 'mongoose';
import User from '../models/User.js';
import { seedQuestions } from './seedQuestions.js';

const seedAdmin = async () => {
  try {
    let admin = await User.findOne({ email: 'admin@nqtcoder.com' });
    
    if (!admin) {
      // Create new admin
      await User.create({
        username: 'admin',
        email: 'admin@nqtcoder.com',
        password: 'AdminPassword@123',
        role: 'admin'
      });
      console.log('Seed: Admin account (admin@nqtcoder.com / AdminPassword@123) successfully seeded.');
    } else {
      // Reset existing admin to ensure password is correct
      admin.password = 'AdminPassword@123';
      admin.role = 'admin';
      await admin.save();
      console.log('Seed: Existing admin@nqtcoder.com credentials reset to: AdminPassword@123');
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
