import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';
import Track from '../models/Track.js';
import TrackProgress from '../models/TrackProgress.js';
import Question from '../models/Question.js';

const BASE_URL = 'http://localhost:5000/api';
const testUsername = `track_tester_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password@123';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@nqtcoder.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword@123';

const runTrackTests = async () => {
  console.log('🚀 Starting Track Progress & Completion Integration Test...');

  let userToken = '';
  let adminToken = '';
  let userHeader = {};
  let adminHeader = {};
  let tempUserId = '';
  let trackId = '';
  let testQuestion = null;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Cleanup lingering test users, tracks, and questions
    await User.deleteMany({ email: /track_tester_.*@example\.com/ });
    await Track.deleteMany({ title: 'E2E Track Progress Track' });
    await Question.deleteMany({ slug: 'e2e-track-test-question' });

    // Login as Admin
    console.log(`Logging in as Admin (${adminEmail})...`);
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword
    });
    adminToken = adminLoginRes.data.token;
    adminHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
    console.log('✅ Admin login successful.');

    // Register & Login as User
    console.log('Registering regular test user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    });
    const userInDb = await User.findOne({ email: testEmail });
    tempUserId = userInDb._id.toString();
    const otpCode = userInDb.verificationCode;
    
    await axios.post(`${BASE_URL}/auth/verify`, {
      email: testEmail,
      code: otpCode
    });

    const userLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    userToken = userLoginRes.data.token;
    userHeader = { headers: { Authorization: `Bearer ${userToken}` } };
    console.log('✅ Regular user login successful.');

    // --- Seed a mock question in DB ---
    testQuestion = await Question.create({
      questionNo: 8888,
      slug: 'e2e-track-test-question',
      title: 'Track Progress Test Question',
      description: 'Simple test description',
      visibleTestCases: [{ input: '1', output: '1' }],
      hiddenTestCases: [{ input: '2', output: '2' }],
      difficulty: 'Easy',
      topic: 'Arrays'
    });
    console.log(`Mock question seeded (ID: ${testQuestion._id}).`);

    // --- Admin creates a track containing this question ---
    console.log('Creating track containing the question...');
    const trackPayload = {
      title: 'E2E Track Progress Track',
      description: 'Tests dynamic percentage completion calculations',
      type: 'topic',
      questions: [testQuestion._id]
    };
    const createTrackRes = await axios.post(`${BASE_URL}/tracks`, trackPayload, adminHeader);
    trackId = createTrackRes.data._id;
    console.log(`✅ Success: Admin created track (ID: ${trackId}).`);

    // --- Check progress for User (Should be 0%) ---
    console.log('Checking user completion progress before solving (expected 0%)...');
    const tracksPreRes = await axios.get(`${BASE_URL}/tracks`, userHeader);
    const targetTrackPre = tracksPreRes.data.find(t => t._id === trackId);
    if (!targetTrackPre) throw new Error('FAIL: Created track not found in list.');
    
    console.log(`Progress: ${targetTrackPre.progressPercent}% (${targetTrackPre.completedQuestions}/${targetTrackPre.totalQuestions} solved)`);
    if (targetTrackPre.progressPercent !== 0) {
      throw new Error(`FAIL: Expected 0% progress, got ${targetTrackPre.progressPercent}%`);
    }
    console.log('✅ Success: Initial progress is 0%.');

    // --- Simulate user solving the question ---
    console.log('Simulating user solving the question...');
    await User.findByIdAndUpdate(tempUserId, {
      $push: { solvedQuestions: testQuestion._id }
    });

    // --- Check progress for User again (Should be 100%) ---
    console.log('Checking user completion progress after solving (expected 100%)...');
    const tracksPostRes = await axios.get(`${BASE_URL}/tracks`, userHeader);
    const targetTrackPost = tracksPostRes.data.find(t => t._id === trackId);
    console.log(`Progress: ${targetTrackPost.progressPercent}% (${targetTrackPost.completedQuestions}/${targetTrackPost.totalQuestions} solved)`);
    if (targetTrackPost.progressPercent !== 100) {
      throw new Error(`FAIL: Expected 100% progress, got ${targetTrackPost.progressPercent}%`);
    }
    console.log('✅ Success: Dynamic progress successfully calculated to 100%.');

    // --- Clean up ---
    console.log('\n--- 🧹 Cleaning Up Test Entities ---');
    await TrackProgress.deleteMany({ track: trackId });
    await Track.deleteOne({ _id: trackId });
    await Question.deleteOne({ _id: testQuestion._id });
    await User.deleteOne({ _id: tempUserId });
    console.log('✅ Database cleaned up.');

    console.log('\n🌟 ALL TRACK AND PROGRESS TESTS PASSED SUCCESSFULLY! 🌟');

  } catch (err) {
    console.error('\n❌ Track Test failed:', err.response ? err.response.data : err.message);
    process.exitCode = 1;
    try {
      if (trackId) {
        await TrackProgress.deleteMany({ track: trackId });
        await Track.deleteOne({ _id: trackId });
      }
      if (testQuestion) {
        await Question.deleteOne({ _id: testQuestion._id });
      }
      await User.deleteOne({ email: testEmail });
    } catch {}
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Track Test complete.');
  }
};

runTrackTests();
