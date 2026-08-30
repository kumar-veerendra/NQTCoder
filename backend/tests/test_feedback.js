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
  let guestFeedbackId = '';
  let authFeedbackId = '';

  try {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to Primary MongoDB Atlas.');
    } catch {
      await mongoose.connect('mongodb://127.0.0.1:27017/nqtcoder');
      console.log('✅ Connected to Local Fallback MongoDB.');
    }

    // Cleanup lingering test users
    await User.deleteMany({ email: /fb_test_.*@example\.com/ });

    // Ensure Admin user exists in DB before logging in
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'fb_admin_test',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      await new Promise(r => setTimeout(r, 500));
    }

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

    // --- 1. Submit feedback as Guest (should succeed) ---
    console.log('Testing guest / anonymous feedback submission...');
    const guestFeedbackPayload = {
      name: 'Guest Tester',
      email: 'guest.tester@example.com',
      type: 'bug',
      subject: 'Compiler Timeout Bug Report',
      message: 'Found that C++ code with infinite loop hits 5000ms TLE as expected.'
    };
    const guestRes = await axios.post(`${BASE_URL}/feedback`, guestFeedbackPayload);
    if (guestRes.status !== 201) throw new Error('Guest feedback submission failed.');
    guestFeedbackId = guestRes.data.feedback._id;
    console.log(`✅ Success: Guest feedback submitted (ID: ${guestFeedbackId}).`);

    // --- 2. Submit feedback authenticated as User (should succeed & attach user) ---
    console.log('Submitting authenticated user feedback...');
    const authFeedbackPayload = {
      type: 'feedback',
      subject: 'Great placement mock test UI',
      message: 'The Cognitive games and Mock Test timer work smoothly.'
    };
    const submitFeedbackRes = await axios.post(`${BASE_URL}/feedback`, authFeedbackPayload, userHeader);
    if (submitFeedbackRes.status !== 201) throw new Error('Authenticated feedback submission failed.');
    authFeedbackId = submitFeedbackRes.data.feedback._id;
    console.log(`✅ Success: Authenticated feedback submitted (ID: ${authFeedbackId}).`);

    // --- 3. Validation: Missing fields ---
    console.log('Testing missing fields validation (should fail with 400)...');
    try {
      await axios.post(`${BASE_URL}/feedback`, { type: 'bug' });
      throw new Error('FAIL: Missing fields were allowed.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Blocked: Missing fields rejected with 400 Bad Request.');
      } else {
        throw err;
      }
    }

    // --- 4. Verify regular user CANNOT view feedback (RBAC) ---
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

    // --- 5. Verify Admin CAN view and manage feedback ---
    console.log('Verifying Admin can view all feedback (should succeed)...');
    const adminFeedbackRes = await axios.get(`${BASE_URL}/feedback`, adminHeader);
    const feedbackList = adminFeedbackRes.data;
    const submittedGuestItem = feedbackList.find(f => f._id === guestFeedbackId);
    const submittedAuthItem = feedbackList.find(f => f._id === authFeedbackId);
    if (!submittedGuestItem || !submittedAuthItem) throw new Error('FAIL: Submitted feedback items not found in admin list.');
    console.log(`✅ Success: Admin fetched feedback list (size: ${feedbackList.length}).`);

    // Update status to 'reviewed'
    console.log('Testing admin status update to reviewed...');
    const updateRes = await axios.patch(`${BASE_URL}/feedback/${authFeedbackId}`, { status: 'reviewed' }, adminHeader);
    if (updateRes.data.status !== 'reviewed') throw new Error('FAIL: Status update failed.');
    console.log('✅ Success: Feedback status updated to reviewed.');

    // --- Clean up ---
    console.log('\n--- 🧹 Cleaning Up Test Entities ---');
    if (guestFeedbackId) await Feedback.deleteOne({ _id: guestFeedbackId });
    if (authFeedbackId) await Feedback.deleteOne({ _id: authFeedbackId });
    if (tempUserId) await User.deleteOne({ _id: tempUserId });
    console.log('✅ Database cleaned up.');
    
    console.log('\n🌟 ALL FEEDBACK & SUPPORT TESTS PASSED SUCCESSFULLY! 🌟');

  } catch (err) {
    console.error('\n❌ Feedback Test failed:', err.response ? err.response.data : err.message);
    process.exitCode = 1;
    try {
      await User.deleteOne({ email: testEmail });
      if (guestFeedbackId) await Feedback.deleteOne({ _id: guestFeedbackId });
      if (authFeedbackId) await Feedback.deleteOne({ _id: authFeedbackId });
    } catch {}
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Feedback Test complete.');
  }
};

runFeedbackTests();
