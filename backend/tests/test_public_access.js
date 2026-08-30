import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5000/api';

// ANSI escape codes for coloring
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}====================================================${RESET}`);
console.log(`${BOLD}       NQTCoder Public/Private Access Boundaries Test ${RESET}`);
console.log(`${BOLD}====================================================${RESET}\n`);

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ${GREEN}✓ PASS:${RESET} ${message}`);
    passedTests++;
  } else {
    console.log(`  ${RED}✗ FAIL:${RESET} ${message}`);
    failedTests++;
  }
}

async function runTests() {
  try {
    // 1. Verify GET /api/questions is public
    console.log(`${YELLOW}Testing public routes (no token required)...${RESET}`);
    try {
      const qRes = await axios.get(`${BASE_URL}/questions`);
      assert(qRes.status === 200, `GET /api/questions returned status ${qRes.status}`);
      assert(Array.isArray(qRes.data) || qRes.data.questions, 'GET /api/questions returned questions list');
      
      const questionsList = Array.isArray(qRes.data) ? qRes.data : qRes.data.questions;
      if (questionsList && questionsList.length > 0) {
        const testQ = questionsList[0];
        
        // Lookup by ID
        const idRes = await axios.get(`${BASE_URL}/questions/${testQ._id}`);
        assert(idRes.status === 200, `GET /api/questions/:idOrSlug by ID returned status 200`);
        assert(idRes.data.title === testQ.title, 'Fetched question by ID matches original title');

        // Lookup by Slug (if slug exists)
        if (testQ.slug) {
          const slugRes = await axios.get(`${BASE_URL}/questions/${testQ.slug}`);
          assert(slugRes.status === 200, `GET /api/questions/:idOrSlug by Slug (${testQ.slug}) returned status 200`);
          assert(slugRes.data.title === testQ.title, 'Fetched question by Slug matches original title');
        } else {
          console.log(`  ${YELLOW}⚠ SKIP:${RESET} No slug found on test question to verify slug lookup`);
        }
      }
    } catch (err) {
      assert(false, `GET /api/questions failed: ${err.message}`);
    }

    // 2. Verify GET /api/tracks is public (optionalProtect)
    try {
      const tRes = await axios.get(`${BASE_URL}/tracks`);
      assert(tRes.status === 200, `GET /api/tracks returned status ${tRes.status}`);
      assert(Array.isArray(tRes.data), 'GET /api/tracks returned track list');
    } catch (err) {
      assert(false, `GET /api/tracks failed: ${err.message}`);
    }

    // 3. Verify GET /api/resources is public
    try {
      const rRes = await axios.get(`${BASE_URL}/resources`);
      assert(rRes.status === 200, `GET /api/resources returned status ${rRes.status}`);
      assert(rRes.data.resources !== undefined, 'GET /api/resources returned resources list');
    } catch (err) {
      assert(false, `GET /api/resources failed: ${err.message}`);
    }

    // Verify GET /api/submissions/compilers is public
    try {
      const cRes = await axios.get(`${BASE_URL}/submissions/compilers`);
      assert(cRes.status === 200, `GET /api/submissions/compilers returned status ${cRes.status}`);
    } catch (err) {
      assert(false, `GET /api/submissions/compilers failed: ${err.message}`);
    }

    // 4. Verify GET /api/feedback is protected for admins (fails anonymous with 401)
    console.log(`\n${YELLOW}Testing protected routes (must block anonymous)...${RESET}`);
    try {
      await axios.get(`${BASE_URL}/feedback`);
      assert(false, 'GET /api/feedback was allowed anonymously!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        assert(true, 'GET /api/feedback blocked anonymously with status 401');
      } else {
        assert(false, `GET /api/feedback failed with unexpected error: ${err.message}`);
      }
    }

    // 5. Verify POST /api/submissions/run is protected (fails with 401)
    try {
      await axios.post(`${BASE_URL}/submissions/run`, {
        code: 'print("hello")',
        language: 'python',
        questionId: new mongoose.Types.ObjectId()
      });
      assert(false, 'POST /api/submissions/run was allowed anonymously!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        assert(true, 'POST /api/submissions/run blocked anonymously with status 401');
      } else {
        assert(false, `POST /api/submissions/run failed with unexpected error: ${err.message}`);
      }
    }

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log(`\n${BOLD}=================== Summary ===================${RESET}`);
    console.log(`Total tests run: ${passedTests + failedTests}`);
    console.log(`Passed:          ${GREEN}${passedTests}${RESET}`);
    console.log(`Failed:          ${failedTests > 0 ? RED + failedTests : GREEN + failedTests}${RESET}`);
    console.log(`${BOLD}====================================================${RESET}\n`);

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

runTests();
