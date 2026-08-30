import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { seedGames } from '../config/seedGames.js';

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    await seedGames();

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding games failed with error:', err.message);
    process.exit(1);
  }
};

run();
