import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { getMCQByFilter } from '../utils/questionLoader.js';

const testAPI = async () => {
  try {
    await connectDB();
    console.log('Testing getMCQByFilter...');

    const emailQuestions = await getMCQByFilter({ topic: 'email-writing' }, '6a22ae4adae63125dc58fcc3');
    console.log(`email-writing questions fetched: ${emailQuestions.length}`);

    const passageQuestions = await getMCQByFilter({ topic: 'passage-recall' }, '6a22ae4adae63125dc58fcc3');
    console.log(`passage-recall questions fetched: ${passageQuestions.length}`);

    process.exit(0);
  } catch (err) {
    console.error('Test API error:', err);
    process.exit(1);
  }
};

testAPI();
