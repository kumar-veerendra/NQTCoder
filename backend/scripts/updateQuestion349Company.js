import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

import Question, { CodingQuestion } from '../models/Question.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
const codingJSONPath = 'config/data/codingQuestions.json';
const targetSlug = 'count-disjoint-pairs-divisible-by-t';
const newCompanyList = ['TCS', 'Infosys'];

const run = async () => {
  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // 1. Update in MongoDB
    const updatedDb = await CodingQuestion.findOneAndUpdate(
      { slug: targetSlug },
      { $set: { company: newCompanyList } },
      { new: true }
    );

    if (updatedDb) {
      console.log(`Successfully updated MongoDB for question '${targetSlug}'. New company array:`, updatedDb.company);
    } else {
      console.log(`WARNING: Question with slug '${targetSlug}' not found in MongoDB.`);
    }

    // 2. Update in codingQuestions.json
    console.log(`Reading ${codingJSONPath}...`);
    let codingData = JSON.parse(fs.readFileSync(codingJSONPath, 'utf8'));

    const idx = codingData.findIndex(q => q.slug === targetSlug);
    if (idx !== -1) {
      codingData[idx].company = newCompanyList;
      fs.writeFileSync(codingJSONPath, JSON.stringify(codingData, null, 2), 'utf8');
      console.log(`Successfully updated ${codingJSONPath} for question '${targetSlug}'. New company array:`, codingData[idx].company);
    } else {
      console.log(`WARNING: Question with slug '${targetSlug}' not found in ${codingJSONPath}.`);
    }

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during update:', error);
    process.exit(1);
  }
};

run();
