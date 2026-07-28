import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env' });

// Import the models using relative paths
import Question, { CodingQuestion } from '../models/Question.js';
import User from '../models/User.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
const correctedPath = '../scratch/corrected_questions.json';
const codingJSONPath = 'config/data/codingQuestions.json';

const run = async () => {
  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // 1. Load corrected questions
    const newQuestions = JSON.parse(fs.readFileSync(correctedPath, 'utf8'));
    console.log(`Loaded ${newQuestions.length} corrected questions.`);

    // 2. Find admin user
    let adminUser = await User.findOne({ role: 'admin' });
    const creatorId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
    console.log(`Using creator ID: ${creatorId} (isAdmin: ${!!adminUser})`);

    // 3. Insert/Upsert into DB
    let insertedCount = 0;
    let updatedCount = 0;

    for (const q of newQuestions) {
      q.domain = 'coding';
      q.kind = 'CodingQuestion';
      q.section = 'programming';
      
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
        updatedCount++;
      } else {
        const lastQ = await Question.findOne({}).sort({ questionNo: -1 }).select('questionNo');
        q.questionNo = lastQ ? (lastQ.questionNo || 0) + 1 : 1;
        insertedCount++;
      }

      delete q._id;

      await CodingQuestion.findOneAndUpdate(
        { slug: q.slug },
        q,
        { upsert: true, new: true }
      );
    }
    console.log(`Database sync complete: ${insertedCount} new inserted, ${updatedCount} updated.`);

    // 4. Merge into codingQuestions.json
    console.log(`Reading existing codingQuestions.json from ${codingJSONPath}...`);
    let codingData = [];
    if (fs.existsSync(codingJSONPath)) {
      const raw = fs.readFileSync(codingJSONPath, 'utf8');
      codingData = JSON.parse(raw);
    }
    console.log(`Existing file has ${codingData.length} questions.`);

    let mergedCount = 0;
    for (const q of newQuestions) {
      // Find if already exists by slug
      const idx = codingData.findIndex(item => item.slug === q.slug);
      
      const formattedQ = {
        ...q,
        content: q.content || { format: 'markdown', assets: [] },
        source: q.source || { type: 'original', isVerified: false, appearances: [] },
        meta: {
          estimatedSolveTimeSec: q.timeLimit ? q.timeLimit * 60 : 90,
          marks: 1,
          negativeMarks: 0,
          status: q.status || 'published',
          createdBy: q.meta?.createdBy || creatorId.toString()
        },
        analytics: q.analytics || { attempts: 0, correct: 0, wrong: 0, skipped: 0 }
      };

      if (idx !== -1) {
        codingData[idx] = formattedQ;
      } else {
        codingData.push(formattedQ);
        mergedCount++;
      }
    }

    fs.writeFileSync(codingJSONPath, JSON.stringify(codingData, null, 2), 'utf8');
    console.log(`Merged and saved codingQuestions.json: ${mergedCount} brand new, ${newQuestions.length - mergedCount} updated. Total now: ${codingData.length}.`);

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during DB insertion:', error);
    process.exit(1);
  }
};

run();
