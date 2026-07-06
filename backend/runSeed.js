import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Question from './models/Question.js';
import { seedSyllabus } from './config/seedSyllabus.js';
import { seedAptitudeQuestions } from './config/seedAptitudeQuestions.js';
import { seedVerbalQuestions } from './config/seedVerbalQuestions.js';
import { seedBlueprints } from './config/seedBlueprints.js';
import { seedCodingQuestions } from './config/seedCodingQuestions.js';

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // Migrate legacy questions
    console.log('Running legacy questions migration...');
    const migrationResult = await Question.collection.updateMany(
      { $or: [{ domain: { $exists: false } }, { kind: { $exists: false } }] },
      { $set: { domain: 'coding', kind: 'CodingQuestion', section: 'programming' } }
    );
    console.log(`Migration result: matched ${migrationResult.matchedCount}, modified ${migrationResult.modifiedCount}`);

    // Seed syllabus
    await seedSyllabus();

    // Seed coding questions
    await seedCodingQuestions();

    // Seed aptitude MCQs
    await seedAptitudeQuestions();

    // Seed verbal questions
    await seedVerbalQuestions();

    // Seed blueprints
    await seedBlueprints();

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process failed with error:', err.message);
    process.exit(1);
  }
};

run();
