// Clear Google client ID at the very top to force the controller to use the dev decoding fallback
process.env.GOOGLE_CLIENT_ID = '';

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import { googleLogin } from '../controllers/authController.js';

const testEmail = 'link_test_unverified@example.com';
const testPassword = 'Password@123';
const mockGoogleId = 'mock_google_id_999888';

const runTest = async () => {
  console.log('🏁 Starting Google Linking & Auto-Verification Unit Test...');

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 2. Cleanup any pre-existing test user
    await User.deleteOne({ email: testEmail });

    // 3. Create a manual unverified user
    console.log('Creating a mock unverified manual registration account...');
    const unverifiedUser = await User.create({
      username: 'manual_user_link',
      email: testEmail,
      password: testPassword,
      role: 'user',
      isVerified: false,
      verificationCode: '652519',
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000)
    });

    console.log(`✅ Created unverified manual user. isVerified: ${unverifiedUser.isVerified}`);

    // 4. Construct a fake Google Credential (JWT) payload
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: mockGoogleId,
      email: testEmail,
      name: "Google Verified Linker"
    })).toString('base64url');
    const signature = "dummy_signature";
    const fakeCredential = `${header}.${payload}.${signature}`;

    // 5. Mock Express Req and Res objects
    const req = {
      body: {
        credential: fakeCredential
      }
    };

    let responseData = null;
    let responseStatus = null;

    const res = {
      status: function (code) {
        responseStatus = code;
        return this;
      },
      json: function (data) {
        responseData = data;
        return this;
      }
    };

    // 6. Invoke the controller directly
    console.log('Executing googleLogin controller logic directly...');
    await googleLogin(req, res);

    if (responseStatus && responseStatus >= 400) {
      throw new Error(`Controller failed with status ${responseStatus}: ${JSON.stringify(responseData)}`);
    }

    console.log(`✅ Controller completed successfully. Response:`, {
      username: responseData?.username,
      email: responseData?.email
    });

    // 7. Verify database record
    const updatedUser = await User.findOne({ email: testEmail });
    if (!updatedUser) {
      throw new Error('User not found in database after login!');
    }

    console.log('\n--- Verification Assertions ---');
    console.log(`Username:               ${updatedUser.username}`);
    console.log(`Email:                  ${updatedUser.email}`);
    console.log(`googleId:               ${updatedUser.googleId}`);
    console.log(`isVerified:             ${updatedUser.isVerified}`);
    console.log(`verificationCode:       ${updatedUser.verificationCode}`);
    console.log(`verificationCodeExpires: ${updatedUser.verificationCodeExpires}`);

    if (updatedUser.googleId !== mockGoogleId) {
      throw new Error(`FAIL: googleId was not linked correctly! Expected: ${mockGoogleId}, Got: ${updatedUser.googleId}`);
    }
    if (updatedUser.isVerified !== true) {
      throw new Error('FAIL: isVerified was not marked true upon Google Login!');
    }
    if (updatedUser.verificationCode !== undefined) {
      throw new Error('FAIL: verificationCode was not cleared!');
    }
    if (updatedUser.verificationCodeExpires !== undefined) {
      throw new Error('FAIL: verificationCodeExpires was not cleared!');
    }

    console.log('\n🎉 ALL LINKING AND AUTO-VERIFICATION TESTS PASSED!');

    // 8. Cleanup
    await User.deleteOne({ email: testEmail });
    console.log('🧹 Cleanup complete.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

runTest();
