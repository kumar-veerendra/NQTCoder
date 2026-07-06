import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Question from '../models/Question.js';

async function testSlugResolution() {
  console.log('🏁 Starting Slug and ObjectId Resolution Test...');
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Fetch any question that has a slug
    const sampleQuestion = await Question.findOne({ slug: { $ne: null, $exists: true } });
    if (!sampleQuestion) {
      console.log('⚠ No questions with a slug found in the database. Seeding/checking first active question...');
      const fallbackQuestion = await Question.findOne({});
      if (!fallbackQuestion) {
        throw new Error('No questions exist in database.');
      }
      // Create a temporary slug if it doesn't have one
      fallbackQuestion.slug = 'temp-test-slug';
      await fallbackQuestion.save();
      return testSlugResolution(); // retry
    }

    const slug = sampleQuestion.slug;
    const id = sampleQuestion._id.toString();
    console.log(`🔍 Test Question Title: "${sampleQuestion.title}"`);
    console.log(`   - Slug: "${slug}"`);
    console.log(`   - ID:   "${id}"`);

    // 1. Resolve using Slug
    let questionBySlug = await Question.findOne({ slug: slug });
    if (!questionBySlug && /^[0-9a-fA-F]{24}$/.test(slug)) {
      questionBySlug = await Question.findById(slug);
    }

    // 2. Resolve using ID
    let questionById = await Question.findOne({ slug: id });
    if (!questionById && /^[0-9a-fA-F]{24}$/.test(id)) {
      questionById = await Question.findById(id);
    }

    // Assertions
    const slugPassed = questionBySlug && questionBySlug._id.toString() === id;
    const idPassed = questionById && questionById.slug === slug;

    if (slugPassed) {
      console.log('✅ PASS: Resolved question using slug successfully.');
    } else {
      console.log('❌ FAIL: Could not resolve question using slug.');
    }

    if (idPassed) {
      console.log('✅ PASS: Resolved question using ObjectId successfully.');
    } else {
      console.log('❌ FAIL: Could not resolve question using ObjectId.');
    }

    if (slugPassed && idPassed) {
      console.log('🎉 ALL SLUG/OBJECTID RESOLUTION TESTS PASSED!');
    } else {
      throw new Error('Resolution check failed.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

testSlugResolution();
