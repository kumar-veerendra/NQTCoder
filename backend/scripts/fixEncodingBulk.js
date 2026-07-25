import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const cp1252 = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85,
  '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A,
  '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92,
  '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C,
  '\u017E': 0x9E, '\u0178': 0x9F
};

function fixEncoding(str) {
  if (typeof str !== 'string') return str;
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);
    if (code <= 0x7F) {
      bytes.push(code);
    } else if (cp1252[char] !== undefined) {
      bytes.push(cp1252[char]);
    } else if (code >= 0x80 && code <= 0xFF) {
      bytes.push(code);
    } else {
      const buf = Buffer.from(char, 'utf8');
      for (let j = 0; j < buf.length; j++) {
        bytes.push(buf[j]);
      }
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

function fixObject(obj) {
  if (typeof obj === 'string') {
    return fixEncoding(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => fixObject(item));
  }
  if (obj !== null && typeof obj === 'object') {
    // Only recurse into plain objects. Do not touch ObjectId, Date, etc.
    if (Object.getPrototypeOf(obj) === Object.prototype) {
      const res = {};
      for (const key in obj) {
        res[key] = fixObject(obj[key]);
      }
      return res;
    }
  }
  return obj;
}

async function main() {
  const jsonPath = './config/data/codingQuestions.json';
  console.log('Reading JSON from:', jsonPath);
  const codingRaw = fs.readFileSync(jsonPath, 'utf8');
  const codingData = JSON.parse(codingRaw);

  console.log('Fixing local JSON codingQuestions.json...');
  const fixedCodingData = codingData.map(q => fixObject(q));
  fs.writeFileSync(jsonPath, JSON.stringify(fixedCodingData, null, 2), 'utf8');
  console.log('Local JSON file fixed and saved.');

  // Now, connect to DB and update all questions
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not found in environment');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  const Question = mongoose.model('Question', new mongoose.Schema({}, { strict: false }));
  console.log('Fetching all questions from MongoDB...');
  const questions = await Question.find({});
  console.log(`Found ${questions.length} questions in DB.`);

  const bulkOps = [];
  for (const q of questions) {
    const qObj = q.toObject();
    
    // We want to delete internal properties that shouldn't be overridden if they are not in schema
    delete qObj.__v;
    delete qObj.createdAt;
    delete qObj.updatedAt;

    const fixedQ = fixObject(qObj);

    // Only update if something changed
    if (JSON.stringify(qObj) !== JSON.stringify(fixedQ)) {
      bulkOps.push({
        updateOne: {
          filter: { _id: q._id },
          update: { $set: fixedQ }
        }
      });
    }
  }

  if (bulkOps.length > 0) {
    console.log(`Bulk updating ${bulkOps.length} documents...`);
    const bulkResult = await Question.bulkWrite(bulkOps);
    console.log(`Bulk write completed: matched ${bulkResult.matchedCount}, modified ${bulkResult.modifiedCount}`);
  } else {
    console.log('No database questions needed update.');
  }

  await mongoose.disconnect();
  console.log('DB disconnected. Success.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
