import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Company from '../models/Company.js';
import CompanyGuide from '../models/CompanyGuide.js';

async function testCompanyGuidesFeature() {
  console.log('🏁 Starting Company Guides Feature Automated Unit & Data Tests...');
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. Verify Companies Collection
    const companies = await Company.find({ isActive: true }).lean();
    console.log(`📊 Active Companies Count: ${companies.length}`);
    if (companies.length === 0) {
      throw new Error('No active companies found in database.');
    }
    console.log('✅ PASS: Companies database records verified.');

    // 2. Verify Published Company Guides
    const publishedGuides = await CompanyGuide.find({ status: 'published' })
      .populate('company', 'name slug logo')
      .lean();
    console.log(`📚 Published Company Guides Count: ${publishedGuides.length}`);
    if (publishedGuides.length === 0) {
      throw new Error('No published company guides found in database.');
    }
    console.log('✅ PASS: Published company guides verified.');

    // 3. Verify Featured Company Guides (for Home Page "Know Your Exam" grid)
    const featuredGuides = await CompanyGuide.find({ status: 'published', featured: true })
      .populate('company', 'name slug logo')
      .lean();
    console.log(`⭐ Featured Published Guides Count: ${featuredGuides.length}`);
    if (featuredGuides.length < 3) {
      throw new Error(`Expected at least 3 featured published guides, but found ${featuredGuides.length}`);
    }
    console.log('✅ PASS: Home page featured guides (>= 3) verified.');

    // 4. Test Key Slugs Validation
    const expectedSlugs = [
      'tcs-nqt',
      'cognizant-2027',
      'ltimindtree-2027',
      'infosys-2027',
      'itc-infotech-2027',
      'ey-2027',
      'pwc-2027',
      'cloudkaptan-2027',
      'streebo-2027'
    ];

    for (const slug of expectedSlugs) {
      const guide = await CompanyGuide.findOne({ slug, status: 'published' }).populate('company').lean();
      if (!guide) {
        throw new Error(`Expected published guide for slug "${slug}" not found.`);
      }
      if (!guide.content || guide.content.trim().length === 0) {
        throw new Error(`Guide for slug "${slug}" has empty content.`);
      }
      if (!guide.roles || guide.roles.length === 0) {
        throw new Error(`Guide for slug "${slug}" has missing roles.`);
      }
      if (!guide.examPattern || guide.examPattern.length === 0) {
        throw new Error(`Guide for slug "${slug}" has missing exam pattern.`);
      }
      console.log(`  ✓ Verified guide: [${guide.company?.name || 'Company'}] "${guide.title}"`);
    }
    console.log('✅ PASS: All 8 key company guides verified with non-empty content, roles & exam patterns.');

    console.log('🎉 ALL COMPANY GUIDES TESTS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

testCompanyGuidesFeature();
