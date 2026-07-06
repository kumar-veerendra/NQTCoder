import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Question from '../models/Question.js';
import UserAttempt from '../models/UserAttempt.js';
import QuestionSession from '../models/QuestionSession.js';
import User from '../models/User.js';
import { submitPracticeAnswer } from '../controllers/practiceController.js';

const runTest = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  try {
    // Find or create test user
    let user = await User.findOne({ email: 'admin@nqtcoder.com' });
    if (!user) {
      user = await User.create({
        username: 'admin',
        email: 'admin@nqtcoder.com',
        password: 'AdminPassword@123',
        role: 'admin',
        isEmailVerified: true
      });
    }

    // Mock Express request/response helpers
    const createMockRes = (resolve, reject) => ({
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        if (this.statusCode >= 400) {
          reject(new Error(`HTTP ${this.statusCode}: ${JSON.stringify(data)}`));
        } else {
          resolve(data);
        }
      }
    });

    console.log('\n--- Step 1: Submitting Sentence Completion (Correct Answers) ---');
    const compQ = await Question.findOne({ questionId: 'VB-COMP-0001' });
    if (!compQ) throw new Error('VB-COMP-0001 not found! Seed might have failed.');

    const req1 = {
      user,
      params: { id: compQ._id.toString() },
      body: {
        submittedAnswer: ['dedicated', 'research'],
        timeTakenSec: 10
      }
    };
    const res1 = await new Promise((resolve, reject) => {
      submitPracticeAnswer(req1, createMockRes(resolve, reject));
    });
    console.log('Submission 1 Response:', res1);
    if (!res1.isCorrect) throw new Error('Correct Sentence Completion answers graded as incorrect!');

    console.log('\n--- Step 2: Submitting Sentence Completion (Incorrect Answers) ---');
    const req2 = {
      user,
      params: { id: compQ._id.toString() },
      body: {
        submittedAnswer: ['lazy', 'play'],
        timeTakenSec: 8
      }
    };
    const res2 = await new Promise((resolve, reject) => {
      submitPracticeAnswer(req2, createMockRes(resolve, reject));
    });
    console.log('Submission 2 Response:', res2);
    if (res2.isCorrect) throw new Error('Incorrect Sentence Completion answers graded as correct!');

    console.log('\n--- Step 3: Submitting Passage Recall (LLM evaluated) ---');
    const recallQ = await Question.findOne({ questionId: 'VB-RECALL-0001' });
    if (!recallQ) throw new Error('VB-RECALL-0001 not found!');

    const req3 = {
      user,
      params: { id: recallQ._id.toString() },
      body: {
        submittedAnswer: ['The Great Wall of China is a series of fortifications built to protect against nomadic invasions from the Eurasian Steppe.'],
        timeTakenSec: 25
      }
    };
    const res3 = await new Promise((resolve, reject) => {
      submitPracticeAnswer(req3, createMockRes(resolve, reject));
    });
    console.log('Submission 3 (Passage Recall) Response:', JSON.stringify(res3, null, 2));

    console.log('\n--- Step 4: Submitting Email Writing (LLM evaluated) ---');
    const emailQ = await Question.findOne({ questionId: 'VB-EMAIL-0001' });
    if (!emailQ) throw new Error('VB-EMAIL-0001 not found!');

    const req4 = {
      user,
      params: { id: emailQ._id.toString() },
      body: {
        submittedAnswer: ['Subject: Sick Leave Request - 2 Days\n\nDear Manager,\nI am suffering from a high fever and the doctor has advised me to rest for two days. John will handle my tasks while I am out. Regards, Alex.'],
        timeTakenSec: 120
      }
    };
    const res4 = await new Promise((resolve, reject) => {
      submitPracticeAnswer(req4, createMockRes(resolve, reject));
    });
    console.log('Submission 4 (Email Writing) Response:', JSON.stringify(res4, null, 2));

    console.log('\nAll Verbal submissions controllers unit tests passed successfully!');

  } finally {
    await mongoose.disconnect();
  }
};

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
