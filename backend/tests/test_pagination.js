import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { getQuestions } from '../controllers/questionController.js';
import Question from '../models/Question.js';

// ANSI escape codes for coloring
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function runTests() {
  console.log(`${BOLD}🏁 Starting Questions Pagination and Search Validation Suite...${RESET}`);

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const totalCount = await Question.countDocuments({ domain: 'coding' });
    console.log(`🔍 Total coding questions in DB: ${totalCount}`);

    // Mocking Express response object
    const createMockResponse = () => {
      let statusValue = 200;
      let jsonPayload = null;

      const res = {
        status: (code) => {
          statusValue = code;
          return res;
        },
        json: (data) => {
          jsonPayload = data;
          return res;
        },
        // Helpers to inspect results
        getStatus: () => statusValue,
        getData: () => jsonPayload
      };
      return res;
    };

    // --- TEST 1: Backward Compatibility (No pagination params) ---
    console.log('\n🏃 Running Test 1: Backward Compatibility (unpaginated raw array)...');
    const req1 = { query: {} };
    const res1 = createMockResponse();
    await getQuestions(req1, res1);

    if (res1.getStatus() !== 200) {
      throw new Error(`Test 1 Failed: Expected status 200, got ${res1.getStatus()}`);
    }
    const data1 = res1.getData();
    if (!Array.isArray(data1)) {
      throw new Error(`Test 1 Failed: Expected response to be an array, got ${typeof data1}`);
    }
    console.log(`${GREEN}✓ Passed (Returned array of size ${data1.length})${RESET}`);

    // --- TEST 2: Basic Pagination (page=1, limit=5) ---
    console.log('\n🏃 Running Test 2: Basic Pagination (page=1, limit=5)...');
    const req2 = { query: { page: '1', limit: '5' } };
    const res2 = createMockResponse();
    await getQuestions(req2, res2);

    if (res2.getStatus() !== 200) {
      throw new Error(`Test 2 Failed: Expected status 200, got ${res2.getStatus()}`);
    }
    const data2 = res2.getData();
    if (typeof data2 !== 'object' || Array.isArray(data2)) {
      throw new Error(`Test 2 Failed: Expected response to be an object, got ${typeof data2}`);
    }
    if (data2.currentPage !== 1) {
      throw new Error(`Test 2 Failed: Expected currentPage to be 1, got ${data2.currentPage}`);
    }
    if (data2.totalQuestions !== totalCount) {
      throw new Error(`Test 2 Failed: Expected totalQuestions to be ${totalCount}, got ${data2.totalQuestions}`);
    }
    if (!data2.questions || !Array.isArray(data2.questions)) {
      throw new Error('Test 2 Failed: Expected data.questions to be an array');
    }
    if (data2.questions.length > 5) {
      throw new Error(`Test 2 Failed: Expected questions length to be <= 5, got ${data2.questions.length}`);
    }

    // Verify fields projected out
    const sample = data2.questions[0];
    if (sample) {
      if (sample.visibleTestCases !== undefined) {
        throw new Error('Test 2 Failed: visibleTestCases should be projected out (undefined)');
      }
      if (sample.hiddenTestCases !== undefined) {
        throw new Error('Test 2 Failed: hiddenTestCases should be projected out (undefined)');
      }
    }
    console.log(`${GREEN}✓ Passed (CurrentPage: ${data2.currentPage}, TotalPages: ${data2.totalPages}, Questions: ${data2.questions.length})${RESET}`);

    // --- TEST 3: Search Filter (search="sum") ---
    console.log('\n🏃 Running Test 3: Search filter parameter...');
    const searchWord = 'sum';
    const req3 = { query: { page: '1', limit: '5', search: searchWord } };
    const res3 = createMockResponse();
    await getQuestions(req3, res3);

    if (res3.getStatus() !== 200) {
      throw new Error(`Test 3 Failed: Expected status 200, got ${res3.getStatus()}`);
    }
    const data3 = res3.getData();
    const allTitlesContain = data3.questions.every(q => q.title.toLowerCase().includes(searchWord));
    if (!allTitlesContain) {
      console.log('Filtered list titles:', data3.questions.map(q => q.title));
      throw new Error(`Test 3 Failed: Expected all filtered questions to contain search term "${searchWord}"`);
    }
    console.log(`${GREEN}✓ Passed (Search term "${searchWord}" correctly matches all returned titles)${RESET}`);

    // --- TEST 4: Category Filtering (difficulty="Medium", page=1, limit=5) ---
    console.log('\n🏃 Running Test 4: Combined Filter (difficulty="Medium", page=1, limit=5)...');
    const req4 = { query: { difficulty: 'Medium', page: '1', limit: '5' } };
    const res4 = createMockResponse();
    await getQuestions(req4, res4);

    if (res4.getStatus() !== 200) {
      throw new Error(`Test 4 Failed: Expected status 200, got ${res4.getStatus()}`);
    }
    const data4 = res4.getData();
    const allMedium = data4.questions.every(q => q.difficulty === 'Medium');
    if (!allMedium) {
      throw new Error(`Test 4 Failed: Expected all returned questions to have difficulty "Medium"`);
    }
    console.log(`${GREEN}✓ Passed (All returned items have difficulty "Medium")${RESET}`);

    console.log(`\n${GREEN}${BOLD}🎉 ALL PAGINATION AND SEARCH TESTS PASSED SUCCESSFULLY!${RESET}`);

  } catch (error) {
    console.error(`\n${RED}❌ Test Suite Failed: ${error.message}${RESET}`);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 Closed database connection.');
    }
  }
}

runTests();
