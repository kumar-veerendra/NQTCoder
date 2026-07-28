import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Question from '../models/Question.js';

const checkDB = async () => {
  try {
    await connectDB();
    console.log('--- MongoDB Diagnostic Report ---');
    
    const passageCount = await Question.countDocuments({ topic: 'passage-recall' });
    const emailCount = await Question.countDocuments({ topic: 'email-writing' });
    const totalVerbal = await Question.countDocuments({ section: 'verbal' });
    const totalQuestions = await Question.countDocuments();

    console.log(`Total Questions in MongoDB: ${totalQuestions}`);
    console.log(`Total Verbal Questions: ${totalVerbal}`);
    console.log(`Passage Recall Questions: ${passageCount}`);
    console.log(`Email Writing Questions: ${emailCount}`);

    const passageSamples = await Question.find({ topic: 'passage-recall' }).limit(3).select('title domain section topic kind');
    console.log('Sample Passage Recall Questions:', passageSamples);

    const emailSamples = await Question.find({ topic: 'email-writing' }).limit(3).select('title domain section topic kind');
    console.log('Sample Email Writing Questions:', emailSamples);

    process.exit(0);
  } catch (err) {
    console.error('DB Check Failed:', err);
    process.exit(1);
  }
};

checkDB();
