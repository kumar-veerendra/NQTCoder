import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';

const BASE_URL = 'http://localhost:5000/api';
const testUsername = `forgot_tester_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'OldPassword@123';
const newPassword = 'NewPassword@123';

const runForgotPasswordTests = async () => {
  console.log('🚀 Starting Forgot Password & Reset OTP Integration Test...');
  console.log(`Test user: Username: ${testUsername}, Email: ${testEmail}`);

  let tempUserId = '';

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Cleanup lingering test users
    await User.deleteMany({ email: /forgot_tester_.*@example\.com/ });

    // 2. Register, Verify, and Login
    console.log('Registering test user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    });

    const userInDb = await User.findOne({ email: testEmail });
    tempUserId = userInDb._id.toString();
    const otpCode = userInDb.verificationCode;
    
    console.log(`Verifying email with OTP: ${otpCode}...`);
    await axios.post(`${BASE_URL}/auth/verify`, {
      email: testEmail,
      code: otpCode
    });
    console.log('✅ Account registered and verified.');

    // 3. Request Password Reset OTP
    console.log('\n--- 1. Testing Forgot Password Request (Option B) ---');
    console.log('Requesting reset code for registered email...');
    const forgotRes = await axios.post(`${BASE_URL}/auth/forgot-password`, { email: testEmail });
    console.log(`Response status: ${forgotRes.status}`);
    console.log(`Response message: "${forgotRes.data.message}"`);
    if (!forgotRes.data.success) {
      throw new Error('Forgot password request failed.');
    }
    console.log('✅ Success: Received generic message for registered email.');

    console.log('Requesting reset code for UNREGISTERED email...');
    const forgotUnregisteredRes = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: 'non_existent_unregistered_email@example.com'
    });
    console.log(`Response status: ${forgotUnregisteredRes.status}`);
    console.log(`Response message: "${forgotUnregisteredRes.data.message}"`);
    if (!forgotUnregisteredRes.data.success) {
      throw new Error('Unregistered email request should still succeed under Option B.');
    }
    console.log('✅ Success: Received generic message for unregistered email (no leakage).');

    // 4. Fetch Reset OTP Code from MongoDB
    console.log('\n--- 2. Fetching reset OTP code from DB ---');
    const updatedUser = await User.findById(tempUserId);
    const resetCode = updatedUser.resetPasswordCode;
    console.log(`Fetched reset code: ${resetCode}`);
    if (!resetCode) {
      throw new Error('Reset code was not saved to the database.');
    }

    // 5. Test Password Reset Validation
    console.log('\n--- 3. Testing Reset Password Validations ---');
    
    // Test with invalid code
    console.log('Submitting incorrect reset code...');
    try {
      await axios.post(`${BASE_URL}/auth/reset-password`, {
        email: testEmail,
        code: '999999',
        newPassword: newPassword
      });
      throw new Error('FAIL: Allowed password reset with invalid OTP code.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✅ Blocked: ${err.response.status} - "${err.response.data.message}"`);
      } else {
        throw err;
      }
    }

    // Test with password too short
    console.log('Submitting weak password (too short)...');
    try {
      await axios.post(`${BASE_URL}/auth/reset-password`, {
        email: testEmail,
        code: resetCode,
        newPassword: '123'
      });
      throw new Error('FAIL: Allowed weak password reset.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✅ Blocked: ${err.response.status} - "${err.response.data.message}"`);
      } else {
        throw err;
      }
    }

    // Test successful reset
    console.log('Submitting valid code and new password...');
    const resetRes = await axios.post(`${BASE_URL}/auth/reset-password`, {
      email: testEmail,
      code: resetCode,
      newPassword: newPassword
    });
    console.log(`Response status: ${resetRes.status}`);
    console.log(`Response message: "${resetRes.data.message}"`);
    if (!resetRes.data.success) {
      throw new Error('Password reset failed.');
    }
    console.log('✅ Success: Password reset successfully.');

    // 6. Verify Reset Code is Cleared
    console.log('\n--- 4. Verifying Reset Code is Cleared in DB ---');
    const clearedUser = await User.findById(tempUserId);
    if (clearedUser.resetPasswordCode !== undefined || clearedUser.resetPasswordCodeExpires !== undefined) {
      throw new Error('FAIL: resetPasswordCode was not cleared from database.');
    }
    console.log('✅ Success: Reset code properties cleared.');

    // 7. Verify Logins
    console.log('\n--- 5. Verifying Login with New Credentials ---');
    
    // Old password should fail
    console.log('Logging in with old password (should fail)...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: testPassword
      });
      throw new Error('FAIL: Login allowed with old password.');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log(`✅ Blocked: ${err.response.status} - "${err.response.data.errors.auth}"`);
      } else {
        throw err;
      }
    }

    // New password should succeed
    console.log('Logging in with new password (should succeed)...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: newPassword
    });
    console.log(`Response status: ${loginRes.status}`);
    if (!loginRes.data.token) {
      throw new Error('Failed to retrieve JWT token on successful login.');
    }
    console.log('✅ Success: Logged in successfully with the new password.');

    // 8. Clean up
    console.log('\n--- 6. Cleaning Up Test User ---');
    await User.deleteOne({ _id: tempUserId });
    console.log('✅ Cleaned up.');

    console.log('\n🌟 ALL FORGOT PASSWORD SYSTEM TESTS PASSED SUCCESSFULLY! 🌟');

  } catch (err) {
    console.error('\n❌ Forgot Password Test failed:', err.response ? err.response.data : err.message);
    process.exitCode = 1;
    try {
      await User.deleteOne({ email: testEmail });
    } catch {}
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Forgot Password Test complete.');
  }
};

runForgotPasswordTests();
