import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import Question, { MCQQuestion } from '../models/Question.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import UserAttempt from '../models/UserAttempt.js';
import TopicProgress from '../models/TopicProgress.js';
import { startPracticeSession, submitPracticeAnswer, getPracticeProgress } from '../controllers/practiceController.js';

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    // Find any user in the database to run attempts as
    let testUser = await User.findOne({});
    if (!testUser) {
      console.log('No user found in the DB. Seeding a temporary test user...');
      testUser = await User.create({
        username: 'practice_test_user',
        email: 'practice_test@nqtcoder.dev',
        password: 'Password123!',
        isVerified: true
      });
    }
    console.log(`Using test user: ${testUser.username} (${testUser._id})`);

    // Retrieve seeded MCQ questions
    const mcqs = await MCQQuestion.find({ topic: 'percentage' });
    if (mcqs.length === 0) {
      throw new Error('MCQ questions for percentage topic not seeded! Please run runSeed.js first.');
    }
    const targetMcq = mcqs[0];
    console.log(`Target MCQ: ${targetMcq.questionId} - ${targetMcq.content.statement}`);

    // Clean any pre-existing attempts/progress for this test user to ensure hermetic assertions
    await UserAttempt.deleteMany({ userId: testUser._id, questionId: targetMcq._id });
    await TopicProgress.deleteMany({ userId: testUser._id, topic: 'percentage' });

    // --- Step 1: Start Practice Session ---
    console.log('\n--- Step 1: Starting Practice Session ---');
    const req1 = {
      user: testUser,
      body: {
        section: 'quant',
        topic: 'percentage'
      }
    };
    const res1 = mockResponse();
    await startPracticeSession(req1, res1);
    console.log('Session Created:', JSON.stringify(res1.body, null, 2));
    const sessionId = res1.body._id;

    // --- Step 2: Submit Correct Answer ---
    console.log('\n--- Step 2: Submitting Correct Answer ---');
    const req2 = {
      user: testUser,
      params: { id: targetMcq._id.toString() },
      body: {
        submittedAnswer: targetMcq.correctAnswer, // e.g., ["B"]
        timeTakenSec: 45,
        sessionId
      }
    };
    const res2 = mockResponse();
    await submitPracticeAnswer(req2, res2);
    console.log('Submission Verdict (Correct):', JSON.stringify(res2.body, null, 2));
    if (!res2.body.isCorrect) {
      throw new Error('Correct answer submission returned false!');
    }

    // --- Step 3: Submit Incorrect Answer ---
    console.log('\n--- Step 3: Submitting Incorrect Answer ---');
    const wrongAnswerOption = targetMcq.options.find(opt => !targetMcq.correctAnswer.includes(opt.optionId)).optionId;
    const req3 = {
      user: testUser,
      params: { id: targetMcq._id.toString() },
      body: {
        submittedAnswer: [wrongAnswerOption],
        timeTakenSec: 15,
        sessionId
      }
    };
    const res3 = mockResponse();
    await submitPracticeAnswer(req3, res3);
    console.log('Submission Verdict (Wrong):', JSON.stringify(res3.body, null, 2));
    if (res3.body.isCorrect) {
      throw new Error('Incorrect answer submission returned true!');
    }

    // --- Step 4: Verify Progress Updates ---
    console.log('\n--- Step 4: Checking TopicProgress Collection ---');
    const req4 = { user: testUser };
    const res4 = mockResponse();
    await getPracticeProgress(req4, res4);
    console.log('TopicProgress list for user:', JSON.stringify(res4.body, null, 2));

    const targetProgress = res4.body.find(p => p.topic === 'percentage');
    if (!targetProgress) {
      throw new Error('No progress record created for percentage topic!');
    }

    console.log('\nAsserting progress aggregates:');
    console.log(`Solved unique questions count: ${targetProgress.solved} (expected 1)`);
    console.log(`Total attempts correct count: ${targetProgress.correct} (expected 1)`);
    console.log(`Accuracy rate: ${targetProgress.accuracy}% (expected 50%)`);
    console.log(`Average solve time: ${targetProgress.averageTime}s (expected 30s)`);

    if (targetProgress.accuracy !== 50) {
      throw new Error(`Accuracy mismatch: expected 50%, got ${targetProgress.accuracy}%`);
    }
    if (targetProgress.averageTime !== 30) {
      throw new Error(`Average time mismatch: expected 30s, got ${targetProgress.averageTime}s`);
    }

    console.log('\nAll Phase 2 attempt-logging and progress-tracking checks passed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    process.exit(1);
  }
};

runTest();
