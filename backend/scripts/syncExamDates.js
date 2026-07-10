import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { CodingQuestion } from '../models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not set in .env');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.\n');

    const filePath = path.join(__dirname, '../config/data/codingQuestions.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const codingQuestions = JSON.parse(rawData);

    console.log(`Loaded ${codingQuestions.length} questions from JSON. Syncing exam dates...`);

    let updatedCount = 0;
    for (const q of codingQuestions) {
      if (q.examDate) {
        const result = await CodingQuestion.updateOne(
          { slug: q.slug },
          { $set: { examDate: q.examDate } }
        );
        if (result.modifiedCount > 0) {
          updatedCount++;
        }
      }
    }

    console.log(`\n✅ Exam dates sync complete. Updated ${updatedCount} questions in database.`);

    await mongoose.disconnect();
    console.log('Connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing exam dates:', err.message);
    process.exit(1);
  }
};

run();
