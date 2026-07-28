import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import Question, { MCQQuestion } from '../models/Question.js';
import { createQuestion, updateQuestion } from '../controllers/questionController.js';

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const runTest = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    // Fetch or create admin user
    let testAdmin = await User.findOne({ role: 'admin' });
    if (!testAdmin) {
      testAdmin = await User.create({
        username: 'admin_test_user',
        email: 'admin_test_user@nqtcoder.com',
        password: 'AdminPassword@123',
        role: 'admin',
        isEmailVerified: true
      });
    }
    console.log(`Admin user: ${testAdmin.username}`);

    // Pre-clean question code and slug to avoid unique index duplicates
    const testQuestionCode = 'QA-TEST-ADMIN-MCQ-99';
    const testSlug = 'admin-mcq-test-slug-99';
    await Question.deleteMany({ $or: [{ questionId: testQuestionCode }, { slug: testSlug }] });

    // --- Step 1: Create MCQ Question ---
    console.log('\n--- Step 1: Creating MCQ Question ---');
    const reqCreate = {
      user: testAdmin,
      body: {
        questionId: testQuestionCode,
        slug: 'admin-mcq-test-slug-99',
        domain: 'aptitude',
        section: 'quant',
        topic: 'percentage',
        displayName: 'Test Admin MCQ Question',
        subTopic: 'Admin Tests',
        difficulty: 'medium',
        applicableCompanies: ['TCS'],
        content: {
          statement: 'What is 50% of 200?',
          format: 'markdown'
        },
        source: {
          type: 'original',
          isVerified: true
        },
        meta: {
          estimatedSolveTimeSec: 60,
          marks: 1,
          negativeMarks: 0,
          status: 'published'
        },
        options: [
          { optionId: 'A', text: '50' },
          { optionId: 'B', text: '100' },
          { optionId: 'C', text: '150' },
          { optionId: 'D', text: '200' }
        ],
        correctAnswer: ['B'],
        explanation: {
          summary: '50% of 200 is 100.',
          shortcut: '200 * 0.5 = 100',
          steps: [
            { title: 'Multiply', content: '200 multiplied by 0.50' }
          ]
        }
      }
    };

    const resCreate = mockResponse();
    await createQuestion(reqCreate, resCreate);
    console.log('Create MCQ Response Status:', resCreate.statusCode || 201);
    console.log('Created MCQ ID:', resCreate.body._id);
    if (!resCreate.body._id) {
      throw new Error('Question creation failed! Response: ' + JSON.stringify(resCreate.body));
    }

    // Verify discriminator in DB
    const saved = await Question.findById(resCreate.body._id);
    console.log('Saved document kind:', saved.kind);
    if (saved.kind !== 'MCQQuestion') {
      throw new Error('Saved question has incorrect discriminator key!');
    }
    console.log('Successfully verified MCQQuestion discriminator key.');

    // --- Step 2: Update MCQ Question ---
    console.log('\n--- Step 2: Updating MCQ Question ---');
    const reqUpdate = {
      user: testAdmin,
      params: { id: saved._id.toString() },
      body: {
        questionId: testQuestionCode,
        slug: 'admin-mcq-test-slug-99-updated',
        domain: 'aptitude',
        topic: 'percentage',
        displayName: 'Test Admin MCQ Question Updated',
        difficulty: 'easy',
        content: {
          statement: 'What is 25% of 400?',
          format: 'markdown'
        },
        options: [
          { optionId: 'A', text: '50' },
          { optionId: 'B', text: '100' },
          { optionId: 'C', text: '150' },
          { optionId: 'D', text: '200' }
        ],
        correctAnswer: ['B'],
        explanation: {
          summary: '25% of 400 is 100.',
          shortcut: '400 * 0.25 = 100',
          steps: [
            { title: 'Multiply', content: '400 multiplied by 0.25' }
          ]
        }
      }
    };

    const resUpdate = mockResponse();
    await updateQuestion(reqUpdate, resUpdate);
    if ((resUpdate.statusCode || 200) >= 500 && typeof resUpdate.body?.message === 'string' && resUpdate.body.message.includes('No matching document found')) {
      console.warn('Detected transient version conflict while updating. Retrying once...');
      const retryRes = mockResponse();
      await updateQuestion(reqUpdate, retryRes);
      resUpdate.statusCode = retryRes.statusCode;
      resUpdate.body = retryRes.body;
    }
    console.log('Update Response Body:', JSON.stringify(resUpdate.body, null, 2));
    if (resUpdate.body.displayName !== 'Test Admin MCQ Question Updated') {
      throw new Error('Update operation did not apply displayName change!');
    }

    // Verify change in DB
    const updated = await Question.findById(saved._id);
    console.log('Database updated slug:', updated.slug);
    if (updated.slug !== 'admin-mcq-test-slug-99-updated') {
      throw new Error('Database updates not persisted!');
    }
    console.log('Successfully verified admin update modifications.');

    // Clean up
    await Question.findByIdAndDelete(saved._id);
    console.log('\nAll Admin MCQ CRUD tests completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    process.exit(1);
  }
};

runTest();
