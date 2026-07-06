/**
 * export_quant_clean.js
 * Exports all quant MCQ questions from MongoDB directly into a clean quantQue.json
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';

const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.model('Question', questionSchema, 'questions');

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Fetch all aptitude MCQ questions
  const questions = await Question.find({ domain: 'aptitude' }).lean();

  console.log(`Found ${questions.length} aptitude questions total`);

  // Separate by section
  const quant  = questions.filter(q => q.section === 'quant');
  const logical = questions.filter(q => q.section === 'logical');
  const verbal  = questions.filter(q => q.section === 'verbal');
  const di      = questions.filter(q => q.section === 'di');

  console.log(`Quant: ${quant.length}, Logical: ${logical.length}, Verbal: ${verbal.length}, DI: ${di.length}`);

  // Clean MongoDB fields
  const clean = (arr) => arr.map(q => {
    const { _id, __v, ...rest } = q;
    return rest;
  });

  const dataDir = path.resolve(__dirname, '../config/data');

  fs.writeFileSync(path.join(dataDir, 'quantQue.json'),   JSON.stringify(clean(quant),   null, 2), 'utf8');
  fs.writeFileSync(path.join(dataDir, 'logicalQue.json'), JSON.stringify(clean(logical), null, 2), 'utf8');

  if (verbal.length > 0)
    fs.writeFileSync(path.join(dataDir, 'verbalQue.json'), JSON.stringify(clean(verbal), null, 2), 'utf8');
  if (di.length > 0)
    fs.writeFileSync(path.join(dataDir, 'diQue.json'), JSON.stringify(clean(di), null, 2), 'utf8');

  console.log('✅ All JSON files exported cleanly!');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
