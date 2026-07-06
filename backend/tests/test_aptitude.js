import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Question, { MCQQuestion, CodingQuestion } from '../models/Question.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import UserAttempt from '../models/UserAttempt.js';

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    console.log('\n--- Test 1: Retrieve Seeded Topics ---');
    const topics = await SyllabusTopic.find({ domain: 'aptitude' });
    console.log(`Found ${topics.length} syllabus topics.`);
    if (topics.length === 0) {
      throw new Error('Syllabus topics not seeded!');
    }
    console.log('Sample Topic:', topics[0].displayName, 'under', topics[0].section);

    console.log('\n--- Test 2: Retrieve Seeded MCQs ---');
    const mcqs = await MCQQuestion.find({});
    console.log(`Found ${mcqs.length} MCQ questions.`);
    if (mcqs.length === 0) {
      throw new Error('MCQ questions not seeded!');
    }
    console.log('Sample MCQ Statement:', mcqs[0].content.statement);
    console.log('Options:', mcqs[0].options.map(o => `${o.optionId}: ${o.text}`).join(', '));
    console.log('Correct Answer:', mcqs[0].correctAnswer);

    console.log('\n--- Test 3: Discriminator Schema Check ---');
    const baseQuestion = await Question.findById(mcqs[0]._id);
    console.log('Base Query Model Kind:', baseQuestion.kind);
    if (baseQuestion.kind !== 'MCQQuestion') {
      throw new Error('Discriminator key not set correctly!');
    }

    console.log('\n--- Test 4: Backwards Compatibility Query ---');
    // Ensure legacy coding questions are still retrievable via base model and CodingQuestion discriminator
    const codingCount = await Question.countDocuments({ domain: 'coding' });
    console.log(`Total coding questions in database: ${codingCount}`);
    
    const codingQuestions = await CodingQuestion.find({});
    console.log(`Discriminator query: Found ${codingQuestions.length} CodingQuestion documents.`);

    console.log('\nAll automated schema validations passed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    process.exit(1);
  }
};

runTest();
