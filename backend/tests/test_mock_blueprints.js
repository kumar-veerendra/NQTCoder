import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import TestBlueprint from '../models/TestBlueprint.js';
import TestInstance from '../models/TestInstance.js';
import Question from '../models/Question.js';
import {
  startMockInstance,
  getMockInstance,
  submitMockItem,
  recordMockViolation,
  finishMockInstance,
  getMockHistory
} from '../controllers/mockTestControllerV2.js';

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

    // Fetch user
    let testUser = await User.findOne({});
    if (!testUser) {
      testUser = await User.create({
        username: 'mock_test_user',
        email: 'mock_test@nqtcoder.dev',
        password: 'Password123!',
        isVerified: true
      });
    }
    console.log(`Test user: ${testUser.username}`);

    // Ensure blueprint exists
    const bp = await TestBlueprint.findOne({ blueprintId: 'TCS-NQT-FULL-01' });
    if (!bp) {
      throw new Error('Blueprint TCS-NQT-FULL-01 not seeded! Run runSeed.js first.');
    }

    // --- Step 1: Start Mock Test Session ---
    console.log('\n--- Step 1: Creating/Resuming Mock Test Instance ---');
    const req1 = { user: testUser, params: { blueprintId: 'TCS-NQT-FULL-01' } };
    const res1 = mockResponse();
    await startMockInstance(req1, res1);
    const instance = res1.body.instance;
    console.log(`Session Initialized. ID: ${instance._id}, Status: ${instance.status}`);
    console.log(`Total questions sampled: ${instance.questions.length}`);

    if (instance.questions.length !== 7) {
      console.warn(`Warning: Expected 7 questions, but database has ${instance.questions.length}. Proceeding...`);
    }

    // --- Step 2: Retrieve Full Instance Details ---
    console.log('\n--- Step 2: Retrieving Instance Questions Content ---');
    const req2 = { user: testUser, params: { instanceId: instance._id } };
    const res2 = mockResponse();
    await getMockInstance(req2, res2);
    console.log(`Populated Questions in details: ${res2.body.questions.length}`);
    const firstQ = res2.body.questions[0];
    console.log(`Sample Question Section: ${firstQ.details.section || 'coding'}`);
    console.log(`Sample Question Statement: ${firstQ.details.content?.statement || firstQ.details.description}`);

    // Verify answer keys are NOT exposed in progress
    if (firstQ.details.correctAnswer || firstQ.details.explanation) {
      throw new Error('Cheating vulnerability: correctAnswer or explanation was exposed in active session details!');
    }
    console.log('Security check passed: answer keys and explanations are stripped during active tests.');

    // --- Step 3: Submit Answer Item ---
    console.log('\n--- Step 3: Submitting MCQ Choice ---');
    const mcqItem = res2.body.questions.find(q => q.details.kind === 'MCQQuestion');
    if (mcqItem) {
      const req3 = {
        user: testUser,
        params: { instanceId: instance._id },
        body: {
          questionId: mcqItem.questionId.toString(),
          submittedAnswer: ['A'],
          timeSpentSec: 20
        }
      };
      const res3 = mockResponse();
      await submitMockItem(req3, res3);
      console.log('Submission Response:', res3.body.message);
    } else {
      console.log('No MCQ questions found in this template.');
    }

    // --- Step 4: Record Cheating Warning ---
    console.log('\n--- Step 4: Recording Tab Violation ---');
    const priorTabSwitches = Number(instance.tabSwitchesCount || 0);
    const req4 = { user: testUser, params: { instanceId: instance._id } };
    const res4 = mockResponse();
    await recordMockViolation(req4, res4);
    console.log(`Tab violation registered. Switches Count: ${res4.body.tabSwitchesCount}`);
    if (res4.body.tabSwitchesCount !== priorTabSwitches + 1) {
      throw new Error('Violations counter failed to increment!');
    }

    // --- Step 5: Finish and Grade Mock Session ---
    console.log('\n--- Step 5: Finalizing Mock Exam & Scoring ---');
    const req5 = { user: testUser, params: { instanceId: instance._id } };
    const res5 = mockResponse();
    await finishMockInstance(req5, res5);
    console.log('Exam Graded:', JSON.stringify(res5.body, null, 2));

    // --- Step 6: Review Completed Exam Details ---
    console.log('\n--- Step 6: Checking Security Details Post-Exam ---');
    const res6 = mockResponse();
    await getMockInstance(req2, res6);
    const postExamQ = res6.body.questions[0];
    console.log('Post-exam correctness matches:', postExamQ.isCorrect);
    
    // In completed status, correctAnswer is returned
    const mockMcqPost = res6.body.questions.find(q => q.details.kind === 'MCQQuestion');
    if (mockMcqPost) {
      console.log('Exposed Correct Answer post-exam:', mockMcqPost.details.correctAnswer);
      if (!mockMcqPost.details.correctAnswer) {
        throw new Error('Review failed: correctAnswer was not returned post-exam!');
      }
    }

    console.log('\nAll Phase 3 mock test blueprint sampling and grading test cases completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    process.exit(1);
  }
};

runTest();
