import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question, { CodingQuestion } from '../models/Question.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedCodingQuestions = async () => {
  try {
    // Try to find an admin user to set as creator, otherwise fall back to a dummy ObjectId
    let adminUser = await User.findOne({ role: 'admin' });
    const creatorId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

    const codingPath = path.join(__dirname, 'data/codingQuestions.json');
    let codingRaw = fs.readFileSync(codingPath, 'utf8');
    if (codingRaw.charCodeAt(0) === 0xFEFF) {
      codingRaw = codingRaw.substr(1);
    }
    const codingData = JSON.parse(codingRaw);

    console.log(`Loaded ${codingData.length} Coding questions from JSON...`);

    for (const q of codingData) {
      // Clean metadata and bind admin creator ID
      q.meta = {
        ...q.meta,
        createdBy: q.meta?.createdBy || creatorId
      };

      // Strip any hardcoded questionNo from JSON to avoid conflicts
      delete q.questionNo;

      // Preserve existing questionNo if already in DB
      const existing = await Question.findOne({ slug: q.slug }).select('questionNo');
      if (existing && existing.questionNo) {
        q.questionNo = existing.questionNo;
      } else {
        const lastQ = await Question.findOne({}).sort({ questionNo: -1 }).select('questionNo');
        q.questionNo = lastQ ? (lastQ.questionNo || 0) + 1 : 1;
      }

      // Ensure domain/kind/section are correct
      q.domain = 'coding';
      q.kind = 'CodingQuestion';
      q.section = 'programming';

      // Remove _id from JSON to avoid casting issues
      delete q._id;

      await CodingQuestion.findOneAndUpdate(
        { slug: q.slug },
        q,
        { upsert: true, new: true }
      );
    }
    console.log('Coding Questions successfully seeded!');
  } catch (error) {
    console.error('Error seeding coding questions:', error.message);
    throw error;
  }
};
