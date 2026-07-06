import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question, { MCQQuestion } from '../models/Question.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedAptitudeQuestions = async () => {
  try {
    // Try to find an admin user to set as creator, otherwise fall back to a dummy ObjectId
    let adminUser = await User.findOne({ role: 'admin' });
    const creatorId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    const quantPath = path.join(__dirname, 'data/quantQue.json');
    const logicalPath = path.join(__dirname, 'data/logicalQue.json');

    const quantData = JSON.parse(fs.readFileSync(quantPath, 'utf8'));
    const logicalData = JSON.parse(fs.readFileSync(logicalPath, 'utf8'));

    const questions = [...quantData, ...logicalData];

    console.log(`Loaded ${questions.length} MCQ questions from JSON...`);

    for (const q of questions) {
      // Clean metadata and bind admin creator ID
      q.meta = {
        ...q.meta,
        createdBy: q.meta?.createdBy || creatorId
      };

      // Strip any hardcoded questionNo from JSON to avoid conflicts
      delete q.questionNo;

      // Preserve existing questionNo if already in DB
      const existing = await Question.findOne({ questionId: q.questionId }).select('questionNo');
      if (existing && existing.questionNo) {
        q.questionNo = existing.questionNo;
      } else {
        const lastQ = await Question.findOne({}).sort({ questionNo: -1 }).select('questionNo');
        q.questionNo = lastQ ? (lastQ.questionNo || 0) + 1 : 1;
      }

      await MCQQuestion.findOneAndUpdate(
        { questionId: q.questionId },
        q,
        { upsert: true, new: true }
      );
    }
    console.log('Aptitude & Logical MCQs successfully seeded!');
  } catch (error) {
    console.error('Error seeding questions:', error.message);
    throw error;
  }
};
