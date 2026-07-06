import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';
import MockTest from '../models/MockTest.js';
import Question from '../models/Question.js';

const BASE_URL = 'http://localhost:5000/api';
const testUsername = `mock_tester_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password@123';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runMockTestTests = async () => {
  console.log('🚀 Starting Mock Test E2E System Integration Test...');
  console.log(`Mock Tester Profile: ${testUsername} (${testEmail})`);

  let token = '';
  let mockTestId = '';
  let authHeader = {};

  try {
    // 1. Connect to MongoDB to prepare database state
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Ensure database contains questions
    const qCount = await Question.countDocuments({});
    if (qCount < 2) {
      throw new Error('Database contains fewer than 2 questions. Seed the database first.');
    }

    // Cleanup any lingering mock testers
    await User.deleteMany({ email: /mock_tester_.*@example\.com/ });

    // 2. Register, Verify, and Login
    console.log('\n--- 🔑 Authenticating Mock Tester ---');
    console.log('Registering user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    });

    const userInDb = await User.findOne({ email: testEmail });
    const otpCode = userInDb.verificationCode;
    console.log(`Verifying email with OTP: ${otpCode}...`);
    await axios.post(`${BASE_URL}/auth/verify`, {
      email: testEmail,
      code: otpCode
    });

    console.log('Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    token = loginRes.data.token;
    authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✅ Authentication successful.');

    // 3. Start Mock Test Session
    console.log('\n--- 📝 Testing Start Mock Test Session ---');
    const startRes = await axios.post(`${BASE_URL}/mocktests/start`, {}, authHeader);
    console.log(`Mock Test started (status: ${startRes.status})`);
    
    mockTestId = startRes.data._id;
    if (!mockTestId) throw new Error('Mock test ID not returned!');
    
    console.log(`Mock Test Session ID: ${mockTestId}`);
    if (startRes.data.q1Status !== 'started' || startRes.data.status !== 'active') {
      throw new Error(`Unexpected start state: status=${startRes.data.status}, q1Status=${startRes.data.q1Status}`);
    }
    console.log('✅ Mock test session initialized successfully.');

    // 4. Test Current Mock Test Session Route
    console.log('\n--- 🔍 Checking GET /mocktests/current ---');
    const currentRes = await axios.get(`${BASE_URL}/mocktests/current`, authHeader);
    if (currentRes.data._id !== mockTestId) {
      throw new Error(`Expected mock test ID ${mockTestId}, got ${currentRes.data._id}`);
    }
    console.log('✅ Active session successfully matched.');

    // 5. Test Tab Switch Violations (Max 3)
    console.log('\n--- ⚠️ Testing Focus Switch Violations & Auto-Submit ---');
    
    console.log('Sending violation 1/3...');
    const v1Res = await axios.post(`${BASE_URL}/mocktests/${mockTestId}/violation`, {}, authHeader);
    console.log(`Violation 1 response: autoSubmitted=${v1Res.data.autoSubmitted}, tabSwitchesCount=${v1Res.data.tabSwitchesCount}`);
    if (v1Res.data.autoSubmitted !== false || v1Res.data.tabSwitchesCount !== 1) {
      throw new Error('Unexpected state after violation 1');
    }

    console.log('Sending violation 2/3...');
    const v2Res = await axios.post(`${BASE_URL}/mocktests/${mockTestId}/violation`, {}, authHeader);
    console.log(`Violation 2 response: autoSubmitted=${v2Res.data.autoSubmitted}, tabSwitchesCount=${v2Res.data.tabSwitchesCount}`);
    if (v2Res.data.autoSubmitted !== false || v2Res.data.tabSwitchesCount !== 2) {
      throw new Error('Unexpected state after violation 2');
    }

    console.log('Sending violation 3/3 (Trigger Auto-Submit)...');
    const v3Res = await axios.post(`${BASE_URL}/mocktests/${mockTestId}/violation`, {}, authHeader);
    console.log(`Violation 3 response: autoSubmitted=${v3Res.data.autoSubmitted}, tabSwitchesCount=${v3Res.data.tabSwitchesCount}`);
    if (v3Res.data.autoSubmitted !== true || v3Res.data.mockTest.status !== 'completed') {
      throw new Error('Expected mock test session to be auto-submitted and terminated.');
    }
    console.log('✅ Auto-submit on 3rd violation verified successfully.');

    // Cleanup violation test session
    await MockTest.deleteOne({ _id: mockTestId });

    // 6. Test Step-by-Step Code Submission & Completion
    console.log('\n--- ⚙️ Testing Queue-based Code Submission & Completion ---');
    
    console.log('Starting a fresh Mock Test session...');
    const newSessionRes = await axios.post(`${BASE_URL}/mocktests/start`, {}, authHeader);
    mockTestId = newSessionRes.data._id;
    console.log(`New Session ID: ${mockTestId}`);

    // Submit Q1
    console.log('Submitting Code for Question 1...');
    const submitQ1Payload = {
      questionNumber: 1,
      code: 'print("Hello Q1")',
      language: 'python',
      timeSpent: 45
    };
    const submitQ1Res = await axios.post(`${BASE_URL}/mocktests/${mockTestId}/submit`, submitQ1Payload, authHeader);
    console.log(`Q1 Submission accepted (status: ${submitQ1Res.status}), Job ID: ${submitQ1Res.data.jobId}`);
    
    // Poll status of Q1 submission
    const q1JobId = submitQ1Res.data.jobId;
    let q1JobCompleted = false;
    let attempts = 0;
    while (!q1JobCompleted && attempts < 15) {
      attempts++;
      await sleep(1000);
      const statusRes = await axios.get(`${BASE_URL}/submissions/status/${q1JobId}`, authHeader);
      console.log(`Polling Q1 Job status: ${statusRes.data.status}`);
      if (statusRes.data.status === 'completed' || statusRes.data.status === 'failed') {
        q1JobCompleted = true;
      }
    }
    if (!q1JobCompleted) throw new Error('Q1 compiler execution timed out.');
    console.log('✅ Question 1 compilation completed.');

    // Submit Q2
    console.log('Submitting Code for Question 2...');
    const submitQ2Payload = {
      questionNumber: 2,
      code: 'print("Hello Q2")',
      language: 'python',
      timeSpent: 60
    };
    const submitQ2Res = await axios.post(`${BASE_URL}/mocktests/${mockTestId}/submit`, submitQ2Payload, authHeader);
    console.log(`Q2 Submission accepted (status: ${submitQ2Res.status}), Job ID: ${submitQ2Res.data.jobId}`);
    
    // Poll status of Q2 submission
    const q2JobId = submitQ2Res.data.jobId;
    let q2JobCompleted = false;
    attempts = 0;
    while (!q2JobCompleted && attempts < 15) {
      attempts++;
      await sleep(1000);
      const statusRes = await axios.get(`${BASE_URL}/submissions/status/${q2JobId}`, authHeader);
      console.log(`Polling Q2 Job status: ${statusRes.data.status}`);
      if (statusRes.data.status === 'completed' || statusRes.data.status === 'failed') {
        q2JobCompleted = true;
      }
    }
    if (!q2JobCompleted) throw new Error('Q2 compiler execution timed out.');
    console.log('✅ Question 2 compilation completed.');

    // 7. Verify Mock Test Completed & Historical Log Added
    console.log('\n--- 📂 Checking GET /mocktests/history ---');
    const historyRes = await axios.get(`${BASE_URL}/mocktests/history`, authHeader);
    console.log(`History count: ${historyRes.data.length}`);
    if (historyRes.data.length === 0) {
      throw new Error('FAIL: Completed mock test was not found in user history.');
    }
    const historicalTest = historyRes.data[0];
    if (historicalTest._id !== mockTestId || historicalTest.status !== 'completed') {
      throw new Error('FAIL: Historical test details mismatch.');
    }
    console.log(`✅ History matches completed mock test ID ${mockTestId} successfully.`);

    // 8. Clean up mock data and test users
    console.log('\n--- 🧹 Cleaning Up Test Accounts ---');
    await MockTest.deleteMany({ user: userInDb._id });
    await User.deleteOne({ _id: userInDb._id });
    console.log('✅ Mock test records and users cleaned up successfully.');

    console.log('\n🌟 ALL MOCK TEST SYSTEM E2E TESTS PASSED SUCCESSFULLY! 🌟');

  } catch (err) {
    console.error('\n❌ Mock Test E2E Test failed:', err.response ? err.response.data : err.message);
    process.exitCode = 1;
    // Attempt cleanup
    try {
      const u = await User.findOne({ email: testEmail });
      if (u) {
        await MockTest.deleteMany({ user: u._id });
        await User.deleteOne({ _id: u._id });
      }
    } catch {}
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Mock Test Integration Test complete.');
  }
};

runMockTestTests();
