import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { seedQuestions } from './config/seedQuestions.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    await seedQuestions();
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
