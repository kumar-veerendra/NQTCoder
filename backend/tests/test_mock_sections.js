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
  nextSectionMockInstance 
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
    const testUser = await User.findOne({});
    console.log(`Test user: ${testUser.username}`);

    const blueprintId = 'TCS-NQT-FULL-01';

    // Pre-clean active instances for this blueprint
    await TestInstance.deleteMany({ userId: testUser._id, blueprintId });

    // --- Step 1: Start Mock Instance ---
    console.log('\n--- Step 1: Starting timed mock exam session ---');
    const req1 = { user: testUser, params: { blueprintId } };
    const res1 = mockResponse();
    await startMockInstance(req1, res1);
    const instance = res1.body.instance;
    console.log(`Instance Created. ID: ${instance._id}, status: ${instance.status}`);
    
    // Assert sectionIndex is assigned
    const hasSectionIndexes = instance.questions.every(q => q.sectionIndex !== undefined);
    if (!hasSectionIndexes) {
      throw new Error('Some questions are missing a sectionIndex assignment!');
    }
    console.log('Successfully confirmed sectionIndex mapped on all questions.');

    // --- Step 2: Get active section and timing details ---
    console.log('\n--- Step 2: Checking section details and timing ---');
    const req2 = { user: testUser, params: { instanceId: instance._id.toString() } };
    const res2 = mockResponse();
    await getMockInstance(req2, res2);
    console.log(`Current Section Index: ${res2.body.currentSectionIndex}`);
    console.log(`Active Section Time Remaining: ${res2.body.activeSectionTimeRemainingSec}s`);
    if (res2.body.currentSectionIndex !== 0) {
      throw new Error('Mock session should start at section index 0!');
    }
    if (res2.body.activeSectionTimeRemainingSec <= 0) {
      throw new Error('Active section time remaining is incorrect!');
    }
    console.log('Active section details and timer verified successfully.');

    // --- Step 3: Advance to next section via API ---
    console.log('\n--- Step 3: Moving to Section 1 ---');
    const res3 = mockResponse();
    await nextSectionMockInstance(req2, res3);
    console.log('Next Section Response:', JSON.stringify(res3.body, null, 2));
    if (res3.body.currentSectionIndex !== 1) {
      throw new Error('Failed to advance currentSectionIndex to 1!');
    }

    // --- Step 4: Simulate Timer Expiry Auto-Advance ---
    console.log('\n--- Step 4: Simulating section timer expiry in DB ---');
    // Set sectionStartedAt to 30 minutes ago (since section 1 has a 25 min duration)
    const thirtyMinsAgo = new Date(Date.now() - (30 * 60 * 1000));
    await TestInstance.findByIdAndUpdate(instance._id, { sectionStartedAt: thirtyMinsAgo });

    console.log('Calling getMockInstance to verify auto-advance on expired section timer...');
    const res4 = mockResponse();
    await getMockInstance(req2, res4);
    console.log(`New Active Section Index (Auto-advanced): ${res4.body.currentSectionIndex}`);
    if (res4.body.currentSectionIndex !== 2) {
      throw new Error('Timer expiry auto-advance failed! Section index should have moved to 2.');
    }
    console.log('Successfully verified section timer auto-advance.');

    // Clean up
    await TestInstance.findByIdAndDelete(instance._id);
    console.log('\nAll Section Timed Navigation tests completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    process.exit(1);
  }
};

runTest();
