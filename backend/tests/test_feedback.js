import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';

const BASE_URL = 'http://localhost:5000/api';
const testUsername = `fb_test_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password@123';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@nqtcoder.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword@123';

const runFeedbackTests = async () => {
  console.log('🚀 Starting Feedback System Integration & RBAC Test...');

  let userToken = '';
  let adminToken = '';
  let userHeader = {};
  let adminHeader = {};
  let tempUserId = '';

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Cleanup lingering test users
    await User.deleteMany({ email: /feedback_tester_.*@example\.com/ });

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

    // --- Submit feedback anonymously (should fail with 401) ---
    console.log('Verifying anonymous feedback submission is blocked...');
    try {
      const feedbackPayload = {
        type: 'bug',
        subject: 'Test Bug Subject',
        message: 'Test bug description'
      };
      await axios.post(`${BASE_URL}/feedback`, feedbackPayload);
      throw new Error('FAIL: Anonymous feedback submission was allowed.');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Blocked: Anonymous submission rejected with 401 Unauthorized.');
      } else {
        throw err;
      }
    }

    // --- Submit feedback authenticated as User (should succeed) ---
    console.log('Submitting authenticated user feedback...');
    const authFeedbackPayload = {
      type: 'bug',
      subject: 'Test Bug Subject',
      message: 'Test bug description'
    };
    const submitFeedbackRes = await axios.post(`${BASE_URL}/feedback`, authFeedbackPayload, userHeader);
    if (submitFeedbackRes.status !== 201) throw new Error('Feedback submission failed.');
    const feedbackId = submitFeedbackRes.data.feedback._id;
    console.log(`✅ Success: Authenticated feedback submitted (ID: ${feedbackId}).`);

    // --- Verify regular user CANNOT view feedback (RBAC) ---
    console.log('Verifying regular user cannot view all feedback (should fail)...');
    try {
      await axios.get(`${BASE_URL}/feedback`, userHeader);
      throw new Error('FAIL: Regular user was allowed to fetch all feedback.');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Blocked: Regular user blocked with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    // --- Verify Admin CAN view feedback ---
    console.log('Verifying Admin can view all feedback (should succeed)...');
    const adminFeedbackRes = await axios.get(`${BASE_URL}/feedback`, adminHeader);
    const feedbackList = adminFeedbackRes.data;
    const submittedItem = feedbackList.find(f => f._id === feedbackId);
    if (!submittedItem) throw new Error('FAIL: Submitted feedback not found in admin list.');
    console.log(`✅ Success: Admin fetched feedback list (size: ${feedbackList.length}).`);

    // --- Clean up ---
    console.log('\n--- 🧹 Cleaning Up Test Entities ---');
    await Feedback.deleteOne({ _id: feedbackId });
    await User.deleteOne({ _id: tempUserId });
    console.log('✅ Database cleaned up.');
    
    console.log('\n🌟 ALL FEEDBACK TESTS PASSED SUCCESSFULLY! 🌟');

  } catch (err) {
    console.error('\n❌ Feedback Test failed:', err.response ? err.response.data : err.message);
    try {
      await User.deleteOne({ email: testEmail });
    } catch {}
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Feedback Test complete.');
  }
};

runFeedbackTests();
