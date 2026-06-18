import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';
import Question from '../models/Question.js';

const BASE_URL = 'http://localhost:5000/api';
const testUsername = `e2e_tester_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password@123';

const runAllTests = async () => {
  console.log('🏁 Starting Master End-to-End System Integration Test...');
  console.log(`Test Coder Profile: ${testUsername} (${testEmail})`);

  let token = '';
  let questionId = '';

  try {
    // 1. Database connection & pre-checks
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const totalQCount = await Question.countDocuments({});
    console.log(`🔍 Total questions in database: ${totalQCount}`);
    if (totalQCount === 0) {
      throw new Error('Database contains 0 questions. Seed the database first.');
    }

    const firstQuestion = await Question.findOne({});
    questionId = firstQuestion._id.toString();
    console.log(`🔍 Using Question ID for compiler tests: ${questionId} ("${firstQuestion.title}")`);

    // 2. Public endpoints pre-checks
    console.log('\n--- 🌐 Checking Public API Metadata Routes ---');
    
    console.log('GET /api/resources/categories...');
    const catRes = await axios.get(`${BASE_URL}/resources/categories`);
    console.log(`✅ Success (status: ${catRes.status}), count: ${catRes.data.length}`);

    console.log('GET /api/questions...');
    const qListRes = await axios.get(`${BASE_URL}/questions`);
    console.log(`✅ Success (status: ${qListRes.status}), count: ${qListRes.data.length}`);

    console.log('GET /api/submissions/load...');
    const loadRes = await axios.get(`${BASE_URL}/submissions/load`);
    console.log(`✅ Success (status: ${loadRes.status}), response:`, loadRes.data);

    console.log('GET /api/leaderboard...');
    const leaderboardRes = await axios.get(`${BASE_URL}/leaderboard`);
    console.log(`✅ Success (status: ${leaderboardRes.status}), entries: ${leaderboardRes.data.length}`);
    const adminCheck = leaderboardRes.data.find(u => u.username === 'admin' || u.email === 'admin@nqtcoder.com');
    if (adminCheck) {
      throw new Error('FAIL: Administrator found in leaderboard list!');
    }
    console.log('✅ Verified: Administrator is correctly filtered out of leaderboard.');

    // 3. User Sign-Up & One-Time OTP Verification Flow
    console.log('\n--- 🔑 Checking Authentication Flow (Sign-up, Blocked Login, OTP Verify) ---');
    
    console.log('Registering user...');
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    });
    console.log(`✅ Status: ${regRes.status}, verificationRequired: ${regRes.data.verificationRequired}`);

    console.log('Verifying login is blocked for unverified user...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: testPassword
      });
      throw new Error('FAIL: Login was allowed for unverified user!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log(`✅ Blocked correctly: ${err.response.status} - ${err.response.data.errors.auth}`);
      } else {
        throw err;
      }
    }

    console.log('Retrieving OTP code from database...');
    const userInDb = await User.findOne({ email: testEmail });
    if (!userInDb) throw new Error('User record was not created in MongoDB!');
    const otpCode = userInDb.verificationCode;
    console.log(`OTP Code found: ${otpCode}`);

    console.log('Submitting verification OTP code...');
    const verifyRes = await axios.post(`${BASE_URL}/auth/verify`, {
      email: testEmail,
      code: otpCode
    });
    console.log(`✅ Verified (status: ${verifyRes.status}), username: ${verifyRes.data.username}`);

    console.log('Logging in to obtain auth JWT token...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    token = loginRes.data.token;
    console.log(`✅ Logged in successfully. Token length: ${token.length}`);

    // Set auth header for following private requests
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 4. Authenticated Private Routes Checks
    console.log('\n--- 🔒 Checking Authenticated Private Routes ---');
    
    console.log('GET /api/auth/profile...');
    const profileRes = await axios.get(`${BASE_URL}/auth/profile`, authHeader);
    console.log(`✅ Success (status: ${profileRes.status}), email: ${profileRes.data.email}`);

    console.log('GET /api/resources...');
    const resRes = await axios.get(`${BASE_URL}/resources`, authHeader);
    console.log(`✅ Success (status: ${resRes.status}), count: ${resRes.data.length}`);

    console.log('GET /api/tracks...');
    const trackRes = await axios.get(`${BASE_URL}/tracks`, authHeader);
    console.log(`✅ Success (status: ${trackRes.status}), count: ${trackRes.data.length}`);

    console.log('GET /api/mocktests/history...');
    const mockRes = await axios.get(`${BASE_URL}/mocktests/history`, authHeader);
    console.log(`✅ Success (status: ${mockRes.status}), count: ${mockRes.data.length}`);

    // 5. Code Execution Engine and Queue Checks
    console.log('\n--- ⚙️ Checking Compiler Sandbox & Queue System ---');
    
    const runPayload = {
      code: 'import sys\nprint("hello world")\nsys.stdout.flush()',
      language: 'python',
      questionId: questionId,
      customInput: 'some input'
    };

    console.log('Submitting code job to compiler queue (POST /api/submissions/run)...');
    const submitRunRes = await axios.post(`${BASE_URL}/submissions/run`, runPayload, authHeader);
    console.log(`✅ Job accepted (status: ${submitRunRes.status}), response:`, submitRunRes.data);

    const jobId = submitRunRes.data.jobId;
    if (!jobId) throw new Error('Backend did not return jobId!');

    console.log(`Polling status of job ${jobId} until complete...`);
    let jobCompleted = false;
    let attempts = 0;

    while (!jobCompleted && attempts < 15) {
      attempts++;
      console.log(`Polling attempt ${attempts}/15...`);
      const statusRes = await axios.get(`${BASE_URL}/submissions/status/${jobId}`, authHeader);
      console.log(`Job status: ${statusRes.data.status}`);

      if (statusRes.data.status === 'completed') {
        console.log('✅ Job completed execution successfully!');
        console.log('Output Result:', statusRes.data.result);
        jobCompleted = true;
      } else if (statusRes.data.status === 'failed') {
        console.log('❌ Job failed execution:', statusRes.data.error);
        jobCompleted = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!jobCompleted) {
      throw new Error('FAIL: Compiler job execution timed out after 15 seconds.');
    }

    // 6. Cleanup
    console.log('\n--- 🧹 Cleaning Up Test Accounts ---');
    await User.deleteOne({ email: testEmail });
    console.log('✅ Temporary user removed from MongoDB.');

    console.log('\n🌟 ALL E2E SYSTEM INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟');

  } catch (err) {
    console.error('\n❌ End-to-End System Test failed:', err.response ? err.response.data : err.message);
    
    // Attempt cleanup even on failure
    try {
      await User.deleteOne({ email: testEmail });
      console.log('🧹 Cleanup complete.');
    } catch {}
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Integration Test complete.');
  }
};

runAllTests();
