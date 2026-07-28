import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';

const API_URL = 'http://localhost:5000/api/auth';
const testUsername = `tester_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password@123';

const runTest = async () => {
  console.log('🚀 Starting Verification OTP End-to-End Test...');
  console.log(`Test user: Username: ${testUsername}, Email: ${testEmail}`);

  try {
    // 1. Connect to MongoDB to read OTP directly
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas for database checks.');

    // 2. Perform register request
    console.log('\nStep 1: Sending registration request to backend...');
    const regRes = await axios.post(`${API_URL}/register`, {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    });

    console.log(`Status: ${regRes.status}`);
    console.log('Response:', regRes.data);

    if (!regRes.data.verificationRequired) {
      throw new Error('Registration did not flag verification required.');
    }
    console.log('✅ Registration successfully redirected to verification state.');

    // 3. Verify that login is BLOCKED
    console.log('\nStep 2: Testing login before verification (should be blocked)...');
    try {
      await axios.post(`${API_URL}/login`, {
        email: testEmail,
        password: testPassword
      });
      throw new Error('Login was not blocked for unverified user!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log(`Status: ${err.response.status}`);
        console.log('Response:', err.response.data);
        console.log('✅ Login blocked successfully with 401 as expected.');
      } else {
        throw err;
      }
    }

    // 4. Retrieve OTP from the database
    console.log('\nStep 3: Fetching OTP code from MongoDB database...');
    let userInDb = null;
    for (let i = 0; i < 5; i++) {
      userInDb = await User.findOne({ email: testEmail });
      if (userInDb && userInDb.verificationCode) break;
      await new Promise(r => setTimeout(r, 300));
    }
    if (!userInDb) {
      throw new Error('User not found in database!');
    }
    const code = userInDb.verificationCode;
    console.log(`Fetched OTP from DB: ${code}`);

    // 5. Send verify request
    console.log('\nStep 4: Sending verify request with correct OTP...');
    const verifyRes = await axios.post(`${API_URL}/verify`, {
      email: testEmail,
      code: code
    });

    console.log(`Status: ${verifyRes.status}`);
    console.log('Response (user details + token):', {
      _id: verifyRes.data._id,
      username: verifyRes.data.username,
      email: verifyRes.data.email,
      token: verifyRes.data.token ? 'JWT_TOKEN_PRESENT' : 'MISSING'
    });
    console.log('✅ Email verification completed successfully.');

    // 6. Verify that login is now ALLOWED
    console.log('\nStep 5: Testing login after verification (should be allowed)...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: testEmail,
      password: testPassword
    });

    console.log(`Status: ${loginRes.status}`);
    console.log('Response (user details + token):', {
      _id: loginRes.data._id,
      username: loginRes.data.username,
      email: loginRes.data.email,
      token: loginRes.data.token ? 'JWT_TOKEN_PRESENT' : 'MISSING'
    });
    console.log('✅ Login successfully allowed after verification.');

    // 7. Cleanup test user
    console.log('\nStep 6: Cleaning up test user...');
    await User.deleteOne({ email: testEmail });
    console.log('✅ Test user deleted from MongoDB.');

  } catch (err) {
    console.error('❌ Test failed:', err.response ? err.response.data : err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 End-to-End Test complete.');
  }
};

runTest();
