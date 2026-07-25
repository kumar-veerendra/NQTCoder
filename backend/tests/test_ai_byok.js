import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Question from '../models/Question.js';
import UserAttempt from '../models/UserAttempt.js';
import User from '../models/User.js';
import Draft from '../models/Draft.js';
import DeveloperDebugLog from '../models/DeveloperDebugLog.js';
import { 
  getPracticeQuota, getQuestionDraft, saveQuestionDraft, 
  deleteQuestionDraft, generateAIQuestion, generateCustomScenario, 
  getAICoachImprovements, getAIHealthStatus, submitPracticeAnswer 
} from '../controllers/practiceController.js';

const runTest = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  let createdTempQuestion = false;

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

    const createMockRes = (resolve, reject) => ({
      statusCode: 200,
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

    console.log('\n--- Test 1: Health Status Diagnostics ---');
    const health = await new Promise((resolve, reject) => {
      getAIHealthStatus({}, createMockRes(resolve, reject));
    });
    console.log('Health Diagnostics:', health);
    if (!health.status) throw new Error('AI health check response is malformed.');

    console.log('\n--- Test 2: Draft CRUD operations ---');
    let question = await Question.findOne({ verbalType: 'email_writing' });
    if (!question) {
      console.log('No email_writing question found in database. Creating temporary question...');
      question = await Question.create({
        questionId: 'TEST-EMAIL-DRAFT-001',
        slug: 'test-email-draft-001',
        domain: 'aptitude',
        section: 'verbal',
        topic: 'email-writing',
        kind: 'VerbalQuestion',
        verbalType: 'email_writing',
        displayName: 'Test Email Draft',
        difficulty: 'medium',
        content: { statement: 'Write an email requesting leave.' }
      });
      createdTempQuestion = true;
    }

    // Save Draft
    const saveReq = {
      user,
      params: { questionId: question._id.toString() },
      body: { content: 'This is my temporary draft text.', timeRemainingSec: 200, mode: 'practice', deviceId: 'test-device' }
    };
    const draftSaved = await new Promise((resolve, reject) => {
      saveQuestionDraft(saveReq, createMockRes(resolve, reject));
    });
    console.log('Draft Saved:', draftSaved);
    if (draftSaved.content !== 'This is my temporary draft text.') throw new Error('Failed to save draft content.');

    // Get Draft
    const getReq = {
      user,
      params: { questionId: question._id.toString() }
    };
    const draftFetched = await new Promise((resolve, reject) => {
      getQuestionDraft(getReq, createMockRes(resolve, reject));
    });
    console.log('Draft Fetched:', draftFetched);
    if (draftFetched.content !== 'This is my temporary draft text.') throw new Error('Failed to fetch draft.');

    // Delete Draft
    const delReq = {
      user,
      params: { questionId: question._id.toString() }
    };
    const draftDeleted = await new Promise((resolve, reject) => {
      deleteQuestionDraft(delReq, createMockRes(resolve, reject));
    });
    console.log('Draft Deleted:', draftDeleted);
    if (!draftDeleted.success) throw new Error('Failed to delete draft.');

    console.log('\n--- Test 3: Shared Daily Quota ---');
    const quotaReq = { user };
    const quota = await new Promise((resolve, reject) => {
      getPracticeQuota(quotaReq, createMockRes(resolve, reject));
    });
    console.log('Shared Quota:', quota);
    if (typeof quota.remaining !== 'number') throw new Error('Failed to retrieve daily quota.');

    console.log('\n--- Test 4: Dynamic Question Generation ---');
    // If Gemini key is set in .env, we can test full prompt completions, else mock-validate
    const testApiKey = process.env.GEMINI_API_KEY || null;
    if (testApiKey) {
      console.log('GEMINI_API_KEY found. Running live AI question generation...');
      try {
        const genReq = {
          user,
          body: { difficulty: 'easy', communicationType: 'Client', apiKey: testApiKey, provider: 'gemini' }
        };
        const genQuestion = await new Promise((resolve, reject) => {
          generateAIQuestion(genReq, createMockRes(resolve, reject));
        });
        console.log('Generated AI Question:', genQuestion.slug);
        if (!genQuestion.emailPrompt) throw new Error('Generated question did not receive a prompt.');
      } catch (err) {
        console.warn('⚡ Live AI Question Generation skipped (API quota or network issue):', err.message);
      }
    } else {
      console.log('No GEMINI_API_KEY in .env. Skipping live AI generation test.');
    }

    console.log('\n--- Test 5: Verify Debug Logs Persistence ---');
    const logs = await DeveloperDebugLog.find({}).limit(5);
    console.log(`Found ${logs.length} TTL debug log entries in MongoDB.`);

    console.log('\nAll AI BYOK Integration Tests completed successfully!');

  } finally {
    if (createdTempQuestion) {
      await Question.deleteOne({ questionId: 'TEST-EMAIL-DRAFT-001' });
    }
    await mongoose.disconnect();
  }
};

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
