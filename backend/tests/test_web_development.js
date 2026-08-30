import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import WebDevQuestion from '../models/WebDevQuestion.js';
import WebDevSubmission from '../models/WebDevSubmission.js';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
const testUsername = `wd_u_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password@123';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@nqtcoder.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

async function runWebDevTests() {
  console.log('🚀 Starting Web Development Module Integration Test...');

  let adminToken = '';
  let adminHeader = {};
  let userToken = '';
  let userHeader = {};
  let tempUserId = '';
  let createdQuestionId = '';

  try {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
      console.log('✅ Connected to Primary MongoDB Atlas.');
    } catch {
      await mongoose.connect('mongodb://127.0.0.1:27017/nqtcoder');
      console.log('✅ Connected to Local Fallback MongoDB.');
    }

    // Ensure Admin user exists
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'wd_admin_test',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    // 1. Admin Login
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    });
    adminToken = adminLoginRes.data.token;
    adminHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
    console.log('✅ Admin login successful.');

    // 2. Register & Verify Student User
    await axios.post(`${BASE_URL}/auth/register`, {
      username: testUsername,
      email: testEmail.toLowerCase(),
      password: testPassword,
      confirmPassword: testPassword,
    });
    let user1InDb = null;
    for (let i = 0; i < 10; i++) {
      user1InDb = await User.findOne({ email: testEmail.toLowerCase() });
      if (user1InDb && user1InDb.verificationCode) break;
      await new Promise((r) => setTimeout(r, 350));
    }
    if (!user1InDb) throw new Error('Student user not found in DB');
    tempUserId = user1InDb._id.toString();

    await axios.post(`${BASE_URL}/auth/verify`, {
      email: testEmail.toLowerCase(),
      code: user1InDb.verificationCode,
    });
    const userLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail.toLowerCase(),
      password: testPassword,
    });
    userToken = userLoginRes.data.token;
    userHeader = { headers: { Authorization: `Bearer ${userToken}` } };
    console.log('✅ Student user registered & logged in.');

    // ── Test 1: Public Question Retrieval & Privacy Sanitization ──
    console.log('\n--- Test 1: Public Question Retrieval & Privacy Check ---');
    const publicRes = await axios.get(`${BASE_URL}/web-development/questions`);
    if (publicRes.status !== 200 || !publicRes.data.questions.length) {
      throw new Error('Failed to retrieve public questions');
    }
    const sample = publicRes.data.questions[0];
    if (sample.solutionCode !== undefined) {
      throw new Error('CRITICAL: solutionCode was exposed in public questions list!');
    }
    console.log(`✅ PASS: Retrieved ${publicRes.data.count} public questions. Zero solutionCode leaked.`);

    // ── Test 2: Single Question by Slug ──
    console.log('\n--- Test 2: Single Question Retrieval by Slug ---');
    const singleRes = await axios.get(`${BASE_URL}/web-development/questions/interactive-counter-card`);
    if (singleRes.status !== 200 || !singleRes.data.question) {
      throw new Error('Failed to retrieve single question by slug');
    }
    if (singleRes.data.question.solutionCode !== undefined) {
      throw new Error('CRITICAL: solutionCode was exposed in single question endpoint!');
    }
    console.log(`✅ PASS: Question "${singleRes.data.question.title}" retrieved cleanly with starterCode.`);

    // ── Test 3: Admin RBAC Protection ──
    console.log('\n--- Test 3: Admin RBAC Protection ---');
    try {
      await axios.get(`${BASE_URL}/web-development/admin/questions`);
      throw new Error('Guest was allowed to access admin questions!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ PASS: Guest blocked with 401 Unauthorized.');
      } else {
        throw err;
      }
    }

    try {
      await axios.get(`${BASE_URL}/web-development/admin/questions`, userHeader);
      throw new Error('Regular student was allowed to access admin questions!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ PASS: Regular student blocked with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    // ── Test 4: Admin Create Question ──
    console.log('\n--- Test 4: Admin Create Question ---');
    const customQPayload = {
      title: 'Dynamic Toggle Button Test',
      slug: `dynamic-toggle-${Math.floor(1000 + Math.random() * 9000)}`,
      difficulty: 'easy',
      category: 'javascript',
      description: 'Create a toggle button that toggles active class on click.',
      requirements: ['Button with id #toggleBtn', 'Toggles .active class'],
      starterCode: {
        html: '<button id="toggleBtn">Toggle</button>',
        css: '.active { background: blue; }',
        javascript: '// logic',
      },
      solutionCode: {
        html: '<button id="toggleBtn">Toggle</button>',
        css: '.active { background: blue; }',
        javascript: 'document.getElementById("toggleBtn").onclick = (e) => e.target.classList.toggle("active");',
      },
      tests: [
        {
          id: 'tog_1',
          description: 'Toggle button exists',
          failureMessage: 'Missing #toggleBtn',
          points: 50,
          type: 'dom',
          target: '#toggleBtn',
          assertion: { type: 'exists' },
        },
        {
          id: 'tog_2',
          description: 'Clicking button toggles active class',
          failureMessage: 'Button did not gain active class',
          points: 50,
          type: 'click',
          target: '#toggleBtn',
          action: { type: 'click' },
          assertion: { type: 'hasClass', className: 'active' },
        },
      ],
      points: 100,
    };

    const createRes = await axios.post(`${BASE_URL}/web-development/admin/questions`, customQPayload, adminHeader);
    if (createRes.status !== 201 || !createRes.data.question) {
      throw new Error('Failed to create question via admin endpoint');
    }
    createdQuestionId = createRes.data.question._id;
    console.log(`✅ PASS: Admin created question "${createRes.data.question.title}" (ID: ${createdQuestionId}, Version: ${createRes.data.question.version}).`);

    // ── Test 5: Admin Update Question & Version Increment ──
    console.log('\n--- Test 5: Admin Update Question & Versioning ---');
    const updateRes = await axios.patch(
      `${BASE_URL}/web-development/admin/questions/${createdQuestionId}`,
      {
        starterCode: {
          html: '<button id="toggleBtn" class="btn">Toggle Me</button>',
          css: '.btn { color: white; } .active { background: blue; }',
          javascript: '// updated starter code',
        },
      },
      adminHeader
    );
    if (updateRes.data.question.version !== 2) {
      throw new Error(`Expected question version 2 after starterCode update, got ${updateRes.data.question.version}`);
    }
    console.log(`✅ PASS: Updated starter code and version auto-incremented to ${updateRes.data.question.version}.`);

    // ── Test 6: Student Submission & Attempt Tracking ──
    console.log('\n--- Test 6: Student Submission & Attempt Tracking ---');
    // Attempt 1: 50% partial
    const submitRes1 = await axios.post(
      `${BASE_URL}/web-development/questions/${createdQuestionId}/submit`,
      {
        htmlCode: '<button id="toggleBtn">Toggle</button>',
        cssCode: '',
        javascriptCode: '',
        testResults: [
          { testId: 'tog_1', passed: true },
          { testId: 'tog_2', passed: false },
        ],
        timeSpent: 45,
      },
      userHeader
    );
    if (submitRes1.data.submission.score !== 50 || submitRes1.data.submission.attemptNumber !== 1) {
      throw new Error(`Attempt 1 failed expected score 50 and attempt 1: ${JSON.stringify(submitRes1.data)}`);
    }
    console.log(`✅ PASS: Attempt 1 saved (Score: 50%, Attempt #: 1, Status: Partial).`);

    // Attempt 2: 100% passed
    const submitRes2 = await axios.post(
      `${BASE_URL}/web-development/questions/${createdQuestionId}/submit`,
      {
        htmlCode: '<button id="toggleBtn">Toggle</button>',
        cssCode: '.active { background: blue; }',
        javascriptCode: 'document.getElementById("toggleBtn").onclick = (e) => e.target.classList.toggle("active");',
        testResults: [
          { testId: 'tog_1', passed: true },
          { testId: 'tog_2', passed: true },
        ],
        timeSpent: 75,
      },
      userHeader
    );
    if (submitRes2.data.submission.score !== 100 || submitRes2.data.submission.attemptNumber !== 2) {
      throw new Error(`Attempt 2 failed expected score 100 and attempt 2: ${JSON.stringify(submitRes2.data)}`);
    }
    console.log(`✅ PASS: Attempt 2 saved (Score: 100%, Attempt #: 2, Status: Passed).`);

    // ── Test 7: Fetch Student Submission History ──
    console.log('\n--- Test 7: Fetch Student Submissions History ---');
    const historyRes = await axios.get(`${BASE_URL}/web-development/questions/${createdQuestionId}/submissions`, userHeader);
    if (historyRes.data.count !== 2) {
      throw new Error(`Expected 2 submissions in history, got ${historyRes.data.count}`);
    }
    console.log(`✅ PASS: Successfully retrieved ${historyRes.data.count} submissions for student.`);

    // ── Test 8: Admin Delete Clean Up ──
    console.log('\n--- Test 8: Admin Delete & Cleanup ---');
    await axios.delete(`${BASE_URL}/web-development/admin/questions/${createdQuestionId}`, adminHeader);
    const verifyDel = await WebDevQuestion.findById(createdQuestionId);
    if (verifyDel) throw new Error('Deleted question still found in DB');
    console.log('✅ PASS: Temporary question and submissions cleaned up.');

    console.log('\n🧹 Cleaning up test user...');
    await User.deleteMany({ email: testEmail.toLowerCase() });
    console.log('✅ Test student user cleaned up.');

    console.log('\n🌟 ALL WEB DEVELOPMENT BACKEND INTEGRATION TESTS PASSED! 🌟');
  } catch (err) {
    console.error('\n❌ Web Dev Test failed:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Web Development Test complete.');
  }
}

runWebDevTests();
