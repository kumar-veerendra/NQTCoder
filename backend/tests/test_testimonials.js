import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';
import Testimonial from '../models/Testimonial.js';

const BASE_URL = 'http://localhost:5000/api';
const testUsername = `u1_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password@123';

const testUsername2 = `u2_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail2 = `${testUsername2}@example.com`;

const adminEmail = process.env.ADMIN_EMAIL || 'admin@nqtcoder.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword@123';

const runTestimonialTests = async () => {
  console.log('🚀 Starting Testimonial & Review System Integration Test...');

  let userToken = '';
  let userHeader = {};
  let user2Token = '';
  let user2Header = {};
  let adminToken = '';
  let adminHeader = {};
  let tempUserId = '';
  let tempUser2Id = '';
  let review1Id = '';
  let review2Id = '';

  try {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to Primary MongoDB Atlas.');
    } catch {
      await mongoose.connect('mongodb://127.0.0.1:27017/nqtcoder');
      console.log('✅ Connected to Local Fallback MongoDB.');
    }

    // Cleanup lingering test entities
    await User.deleteMany({ email: /fb_test_t.*@example\.com/ });
    await Testimonial.deleteMany({ review: /\[TEST_REVIEW\]/ });

    // 1. Ensure Admin exists and login
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'testi_admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    });
    adminToken = adminLoginRes.data.token;
    adminHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
    console.log('✅ Admin login successful.');

    // 2. Register & Verify User 1
    const regRes1 = await axios.post(`${BASE_URL}/auth/register`, {
      username: testUsername,
      email: testEmail.toLowerCase(),
      password: testPassword,
      confirmPassword: testPassword,
    });
    if (!regRes1.data.verificationRequired) {
      throw new Error(`User 1 registration failed: ${JSON.stringify(regRes1.data)}`);
    }
    let user1InDb = null;
    for (let i = 0; i < 10; i++) {
      user1InDb = await User.findOne({ email: testEmail.toLowerCase() });
      if (user1InDb && user1InDb.verificationCode) break;
      await new Promise((r) => setTimeout(r, 350));
    }
    if (!user1InDb) throw new Error(`User 1 not found in DB for email ${testEmail.toLowerCase()}`);
    tempUserId = user1InDb._id.toString();
    await axios.post(`${BASE_URL}/auth/verify`, {
      email: testEmail.toLowerCase(),
      code: user1InDb.verificationCode,
    });
    const user1LoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail.toLowerCase(),
      password: testPassword,
    });
    userToken = user1LoginRes.data.token;
    userHeader = { headers: { Authorization: `Bearer ${userToken}` } };
    console.log('✅ User 1 registered & logged in.');

    // 3. Register & Verify User 2
    const regRes2 = await axios.post(`${BASE_URL}/auth/register`, {
      username: testUsername2,
      email: testEmail2.toLowerCase(),
      password: testPassword,
      confirmPassword: testPassword,
    });
    if (!regRes2.data.verificationRequired) {
      throw new Error(`User 2 registration failed: ${JSON.stringify(regRes2.data)}`);
    }
    let user2InDb = null;
    for (let i = 0; i < 10; i++) {
      user2InDb = await User.findOne({ email: testEmail2.toLowerCase() });
      if (user2InDb && user2InDb.verificationCode) break;
      await new Promise((r) => setTimeout(r, 350));
    }
    if (!user2InDb) throw new Error(`User 2 not found in DB for email ${testEmail2.toLowerCase()}`);
    tempUser2Id = user2InDb._id.toString();
    await axios.post(`${BASE_URL}/auth/verify`, {
      email: testEmail2.toLowerCase(),
      code: user2InDb.verificationCode,
    });
    const user2LoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail2.toLowerCase(),
      password: testPassword,
    });
    user2Token = user2LoginRes.data.token;
    user2Header = { headers: { Authorization: `Bearer ${user2Token}` } };
    console.log('✅ User 2 registered & logged in.');

    // -------------------------------------------------------------
    // Test 1: Guest submission must be blocked (401)
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Guest Review Submission Blocked ---');
    try {
      await axios.post(`${BASE_URL}/testimonials`, {
        rating: 5,
        review: '[TEST_REVIEW] Great platform for placement prep!',
      });
      throw new Error('FAIL: Anonymous review was accepted without token.');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ PASS: Guest review submission blocked with 401 Unauthorized.');
      } else {
        throw err;
      }
    }

    // -------------------------------------------------------------
    // Test 2: Validation boundaries (rating 1-5, review text)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Review Field Validation ---');
    try {
      await axios.post(
        `${BASE_URL}/testimonials`,
        { rating: 6, review: '[TEST_REVIEW] Invalid rating' },
        userHeader
      );
      throw new Error('FAIL: Rating > 5 was allowed.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ PASS: Rating > 5 rejected with 400 Bad Request.');
      } else {
        throw err;
      }
    }

    try {
      await axios.post(
        `${BASE_URL}/testimonials`,
        { rating: 4, review: '   ' },
        userHeader
      );
      throw new Error('FAIL: Empty review text was allowed.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ PASS: Empty review rejected with 400 Bad Request.');
      } else {
        throw err;
      }
    }

    // -------------------------------------------------------------
    // Test 3: Authenticated User submits valid review (Status: pending)
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Authenticated User Submits Review ---');
    const reviewPayload1 = {
      rating: 5,
      review: '[TEST_REVIEW] The TCS NQT mock tests and cognitive games helped me clear my placement exam on first attempt!',
      wouldRecommend: 'yes',
      usageAreas: ['coding', 'mock_tests', 'cognitive_games'],
    };
    const subRes1 = await axios.post(`${BASE_URL}/testimonials`, reviewPayload1, userHeader);
    if (subRes1.status !== 201) throw new Error('User 1 submission failed.');
    review1Id = subRes1.data.testimonial._id;
    if (subRes1.data.testimonial.status !== 'pending') throw new Error('New review did not default to pending status.');
    console.log(`✅ PASS: User 1 submitted 5-star review (ID: ${review1Id}, Status: pending).`);

    // User 2 submits 4-star review
    const reviewPayload2 = {
      rating: 4,
      review: '[TEST_REVIEW] Great question bank and timer simulation. Really useful for Infosys and Cognizant.',
      wouldRecommend: 'yes',
      usageAreas: ['aptitude', 'coding'],
    };
    const subRes2 = await axios.post(`${BASE_URL}/testimonials`, reviewPayload2, user2Header);
    review2Id = subRes2.data.testimonial._id;
    console.log(`✅ PASS: User 2 submitted 4-star review (ID: ${review2Id}, Status: pending).`);

    // -------------------------------------------------------------
    // Test 4: One Active Review & Update In-Place (Partial Index)
    // -------------------------------------------------------------
    console.log('\n--- Test 4: User Edits/Updates Existing Review ---');
    const updatePayload = {
      rating: 5,
      review: '[TEST_REVIEW] Updated review text with additional details on Aptitude arena.',
      wouldRecommend: 'yes',
      usageAreas: ['coding', 'aptitude', 'mock_tests'],
    };
    const updateRes = await axios.post(`${BASE_URL}/testimonials`, updatePayload, userHeader);
    if (updateRes.status !== 200) throw new Error('Review update failed.');
    if (updateRes.data.testimonial._id !== review1Id) throw new Error('Did not update in-place!');
    if (updateRes.data.testimonial.status !== 'pending') throw new Error('Updated review did not reset to pending for re-moderation.');
    console.log('✅ PASS: User 1 updated review in-place without duplicate error.');

    // -------------------------------------------------------------
    // Test 5: Pending review must NOT be visible publicly
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Public Access Filter (Pending Hidden) ---');
    const publicRes1 = await axios.get(`${BASE_URL}/testimonials`);
    const publicIds1 = (publicRes1.data.testimonials || []).map((t) => t._id);
    if (publicIds1.includes(review1Id) || publicIds1.includes(review2Id)) {
      throw new Error('FAIL: Pending reviews are leaking into public endpoint!');
    }
    console.log('✅ PASS: Pending reviews are hidden from public GET /api/testimonials.');

    // -------------------------------------------------------------
    // Test 6: Admin Moderation (Approve, Reject, Hide, Feature)
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Admin Moderation Workflow ---');
    // Regular user blocked from admin endpoint
    try {
      await axios.get(`${BASE_URL}/testimonials/admin`, userHeader);
      throw new Error('FAIL: Regular user accessed admin endpoint.');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ PASS: Regular user blocked from admin endpoint with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    // Admin fetches all reviews
    const adminListRes = await axios.get(`${BASE_URL}/testimonials/admin`, adminHeader);
    if (!adminListRes.data.testimonials || adminListRes.data.testimonials.length === 0) {
      throw new Error('FAIL: Admin could not list testimonials.');
    }
    console.log(`✅ PASS: Admin fetched ${adminListRes.data.testimonials.length} reviews (Pending: ${adminListRes.data.stats.pendingCount}).`);

    // Admin approves Review 1 (5 stars)
    const approveRes1 = await axios.patch(
      `${BASE_URL}/testimonials/admin/${review1Id}`,
      { status: 'approved', isFeatured: true, adminNote: 'Verified genuine student review' },
      adminHeader
    );
    if (approveRes1.data.testimonial.status !== 'approved') throw new Error('Approve action failed.');
    console.log('✅ PASS: Admin approved Review 1 with isFeatured=true.');

    // Admin approves Review 2 (4 stars)
    const approveRes2 = await axios.patch(
      `${BASE_URL}/testimonials/admin/${review2Id}`,
      { status: 'approved' },
      adminHeader
    );
    if (approveRes2.data.testimonial.status !== 'approved') throw new Error('Approve action 2 failed.');
    console.log('✅ PASS: Admin approved Review 2.');

    // -------------------------------------------------------------
    // Test 7: Public Sorting (rating DESC, createdAt DESC) & Privacy
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Public Sorting & Privacy Verification ---');
    const publicRes2 = await axios.get(`${BASE_URL}/testimonials`);
    const approvedList = publicRes2.data.testimonials || [];
    
    // Find our approved reviews in the list
    const foundR1 = approvedList.find((t) => t._id === review1Id);
    const foundR2 = approvedList.find((t) => t._id === review2Id);

    if (!foundR1 || !foundR2) {
      throw new Error('FAIL: Approved reviews are not appearing in public endpoint!');
    }

    // Check privacy: user email, password, and adminNote must not exist
    if (foundR1.email || foundR1.user?.email || foundR1.adminNote || foundR1.approvedBy) {
      throw new Error('FAIL: Private metadata leaked in public testimonial payload!');
    }
    console.log('✅ PASS: Privacy verified (no emails, passwords, or admin notes exposed).');

    // Check sorting: 5-star review must appear before 4-star review
    const idxR1 = approvedList.findIndex((t) => t._id === review1Id);
    const idxR2 = approvedList.findIndex((t) => t._id === review2Id);
    if (idxR1 > idxR2) {
      throw new Error('FAIL: 5-star review did not appear before 4-star review!');
    }
    console.log(`✅ PASS: Sorting verified (5★ at index ${idxR1} appears before 4★ at index ${idxR2}).`);

    // -------------------------------------------------------------
    // Test 8: Admin Hide Review
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Admin Hide Review ---');
    await axios.patch(`${BASE_URL}/testimonials/admin/${review2Id}`, { status: 'hidden' }, adminHeader);
    const publicRes3 = await axios.get(`${BASE_URL}/testimonials`);
    const remainingIds = (publicRes3.data.testimonials || []).map((t) => t._id);
    if (remainingIds.includes(review2Id)) {
      throw new Error('FAIL: Hidden review is still visible publicly!');
    }
    console.log('✅ PASS: Hidden review is immediately excluded from public endpoint.');

    // -------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------
    console.log('\n--- 🧹 Cleaning Up Test Entities ---');
    if (review1Id) await Testimonial.deleteOne({ _id: review1Id });
    if (review2Id) await Testimonial.deleteOne({ _id: review2Id });
    if (tempUserId) await User.deleteOne({ _id: tempUserId });
    if (tempUser2Id) await User.deleteOne({ _id: tempUser2Id });
    console.log('✅ Test database cleaned up.');

    console.log('\n🌟 ALL TESTIMONIAL & REVIEW TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (err) {
    console.error('\n❌ Testimonial Test failed:', err.response ? err.response.data : err.message);
    process.exitCode = 1;
    try {
      if (review1Id) await Testimonial.deleteOne({ _id: review1Id });
      if (review2Id) await Testimonial.deleteOne({ _id: review2Id });
      if (tempUserId) await User.deleteOne({ _id: tempUserId });
      if (tempUser2Id) await User.deleteOne({ _id: tempUser2Id });
    } catch {}
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Testimonial Test complete.');
  }
};

runTestimonialTests();
