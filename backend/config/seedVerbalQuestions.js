import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question, { VerbalQuestion } from '../models/Question.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedVerbalQuestions = async () => {
  try {
    // Try to find an admin user to set as creator, otherwise fall back to a dummy ObjectId
    let adminUser = await User.findOne({ role: 'admin' });
    const creatorId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    const verbalPath = path.join(__dirname, 'data/verbalQue.json');
    const verbalData = JSON.parse(fs.readFileSync(verbalPath, 'utf8'));

    console.log(`Loaded ${verbalData.length} Verbal questions from JSON...`);

    for (const q of verbalData) {
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

      await VerbalQuestion.findOneAndUpdate(
        { questionId: q.questionId },
        q,
        { upsert: true, new: true }
      );
    }
    console.log('Verbal Questions successfully seeded!');
  } catch (error) {
    console.error('Error seeding verbal questions:', error.message);
    throw error;
  }
};
