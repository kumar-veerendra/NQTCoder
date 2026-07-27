import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import Question, { MCQQuestion } from '../models/Question.js';
import Bookmark from '../models/Bookmark.js';
import RevisionQueue from '../models/RevisionQueue.js';
import { 
  toggleBookmark, 
  getBookmarks, 
  getRevisionQueue, 
  submitPracticeAnswer 
} from '../controllers/practiceController.js';

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

    // Fetch or create user
    let testUser = await User.findOne({});
    if (!testUser) {
      testUser = await User.create({
        username: 'bm_test_user',
        email: 'bm_test_user@nqtcoder.com',
        password: 'Password@123',
        isEmailVerified: true
      });
    }
    console.log(`Test user: ${testUser.username}`);

    // Retrieve or create seeded MCQ question
    let mcq = await MCQQuestion.findOne({ topic: 'percentage' });
    if (!mcq) {
      mcq = await MCQQuestion.findOne({});
    }
    if (!mcq) {
      console.log('No MCQ question found in DB. Creating fallback MCQ question...');
      mcq = await MCQQuestion.create({
        questionId: 'BM-MCQ-TEST-001',
        slug: 'bm-mcq-test-001',
        domain: 'aptitude',
        section: 'quant',
        topic: 'percentage',
        displayName: 'Bookmark Test MCQ',
        difficulty: 'medium',
        content: { statement: 'What is 50% of 100?' },
        options: [
          { optionId: 'A', text: '25' },
          { optionId: 'B', text: '50' },
          { optionId: 'C', text: '75' }
        ],
        correctAnswer: ['B'],
        kind: 'MCQQuestion'
      });
    }
    console.log(`MCQ Question ID: ${mcq._id}`);

    // Clean any pre-existing bookmarks/revision for this test user
    await Bookmark.deleteMany({ userId: testUser._id, questionId: mcq._id });
    await RevisionQueue.deleteMany({ userId: testUser._id, questionId: mcq._id });

    // --- Test 1: Add Bookmark ---
    console.log('\n--- Test 1: Bookmarking Question ---');
    const req1 = { user: testUser, params: { id: mcq._id.toString() } };
    const res1 = mockResponse();
    await toggleBookmark(req1, res1);
    console.log('Toggle Bookmark Response (Add):', JSON.stringify(res1.body, null, 2));
    if (!res1.body.bookmarked) {
      throw new Error('Bookmark toggle failed to add!');
    }

    // Check if it shows up in getBookmarks
    const req2 = { user: testUser };
    const res2 = mockResponse();
    await getBookmarks(req2, res2);
    console.log(`Found ${res2.body.length} bookmarks for user.`);
    const isBookmarkedInList = res2.body.some(b => b.questionId && b.questionId._id.toString() === mcq._id.toString());
    if (!isBookmarkedInList) {
      throw new Error('Bookmarked question not present in getBookmarks response!');
    }
    console.log('Successfully confirmed bookmark in library.');

    // --- Test 2: Remove Bookmark ---
    console.log('\n--- Test 2: Removing Bookmark ---');
    const res3 = mockResponse();
    await toggleBookmark(req1, res3);
    console.log('Toggle Bookmark Response (Remove):', JSON.stringify(res3.body, null, 2));
    if (res3.body.bookmarked) {
      throw new Error('Bookmark toggle failed to remove!');
    }

    const res4 = mockResponse();
    await getBookmarks(req2, res4);
    const isRemovedFromList = !res4.body.some(b => b.questionId?._id.toString() === mcq._id.toString());
    if (!isRemovedFromList) {
      throw new Error('Bookmarked question still present after removal!');
    }
    console.log('Successfully confirmed bookmark deletion.');

    // --- Test 3: Revision Queue Auto-Flag & Resolve ---
    console.log('\n--- Test 3: Simulating Revision Queue Flagging & Resolution ---');
    
    // Clear attempts to start fresh
    await mongoose.connection.db.collection('userattempts').deleteMany({ userId: testUser._id, questionId: mcq._id });

    // Submit incorrect answer 1
    console.log('Submitting incorrect answer #1...');
    const wrongAnswerOption = mcq.options.find(opt => !mcq.correctAnswer.includes(opt.optionId)).optionId;
    const submitReq1 = {
      user: testUser,
      params: { id: mcq._id.toString() },
      body: {
        submittedAnswer: [wrongAnswerOption],
        timeTakenSec: 10
      }
    };
    const submitRes1 = mockResponse();
    await submitPracticeAnswer(submitReq1, submitRes1);

    // Assert revision queue is still empty (needs 2 wrong attempts)
    const queueRes1 = mockResponse();
    await getRevisionQueue(req2, queueRes1);
    console.log(`Queue size after 1 failure: ${queueRes1.body.length}`);
    if (queueRes1.body.some(r => r.questionId._id.toString() === mcq._id.toString())) {
      throw new Error('Question flagged to RevisionQueue prematurely after only 1 wrong attempt!');
    }

    // Submit incorrect answer 2
    console.log('Submitting incorrect answer #2...');
    const submitRes2 = mockResponse();
    await submitPracticeAnswer(submitReq1, submitRes2);

    // Assert revision queue now contains the question
    const queueRes2 = mockResponse();
    await getRevisionQueue(req2, queueRes2);
    console.log(`Queue size after 2 failures: ${queueRes2.body.length}`);
    const queueEntry = await RevisionQueue.findOne({ userId: testUser._id, questionId: mcq._id });
    if (!queueEntry) {
      throw new Error('Question was NOT flagged to RevisionQueue after 2 incorrect attempts!');
    }
    console.log(`Successfully verified question in RevisionQueue. Wrong count: ${queueEntry.wrongAttemptsCount}`);

    // Submit correct answer to resolve it
    console.log('Submitting correct answer...');
    const submitReqCorrect = {
      user: testUser,
      params: { id: mcq._id.toString() },
      body: {
        submittedAnswer: mcq.correctAnswer,
        timeTakenSec: 30
      }
    };
    const submitResCorrect = mockResponse();
    await submitPracticeAnswer(submitReqCorrect, submitResCorrect);

    // Assert revision queue is now empty (resolved!)
    const queueRes3 = mockResponse();
    await getRevisionQueue(req2, queueRes3);
    console.log(`Queue size after correct solve: ${queueRes3.body.length}`);
    const remainingEntry = await RevisionQueue.findOne({ userId: testUser._id, questionId: mcq._id });
    if (remainingEntry) {
      throw new Error('Question remained in RevisionQueue after correct answer submission!');
    }
    console.log('Successfully verified auto-resolution of revision flags.');

    console.log('\nAll Phase 4 bookmarking and revision queue tests completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    process.exit(1);
  }
};

runTest();
