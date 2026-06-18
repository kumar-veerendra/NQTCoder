import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import axios from 'axios';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import ResourceCategory from '../models/ResourceCategory.js';

const BASE_URL = 'http://localhost:5000/api';
const testUsername = `resource_tester_${Math.floor(100000 + Math.random() * 900000)}`;
const testEmail = `${testUsername}@example.com`;
const testPassword = 'Password@123';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@nqtcoder.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword@123';

const runResourceTests = async () => {
  console.log('🚀 Starting Resource Management & RBAC Integration Test...');

  let userToken = '';
  let adminToken = '';
  let userHeader = {};
  let adminHeader = {};
  let tempUserId = '';
  let categoryId = '';
  let resourceId = '';

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Cleanup lingering test users and categories
    await User.deleteMany({ email: /resource_tester_.*@example\.com/ });
    const oldCategory = await ResourceCategory.findOne({ title: 'E2E Test Category' });
    if (oldCategory) {
      await Resource.deleteMany({ category: oldCategory._id });
      await ResourceCategory.deleteOne({ _id: oldCategory._id });
    }

    // Login as Admin
    console.log(`Logging in as Admin (${adminEmail})...`);
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword
    });
    adminToken = adminLoginRes.data.token;
    adminHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
    console.log('✅ Admin login successful.');

    // Register & Login as User
    console.log('Registering regular test user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    });
    const userInDb = await User.findOne({ email: testEmail });
    tempUserId = userInDb._id.toString();
    const otpCode = userInDb.verificationCode;
    
    await axios.post(`${BASE_URL}/auth/verify`, {
      email: testEmail,
      code: otpCode
    });

    const userLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    userToken = userLoginRes.data.token;
    userHeader = { headers: { Authorization: `Bearer ${userToken}` } };
    console.log('✅ Regular user login successful.');

    // --- Get Categories (Public API) ---
    console.log('Fetching resource categories (public request)...');
    const categoriesRes = await axios.get(`${BASE_URL}/resources/categories`);
    console.log(`✅ Success: Categories fetched (count: ${categoriesRes.data.length}).`);

    // --- User attempts to create a category (RBAC Check) ---
    console.log('Verifying user cannot create category (should fail)...');
    try {
      await axios.post(`${BASE_URL}/resources/categories`, { title: 'Unauthorized Category' }, userHeader);
      throw new Error('FAIL: Regular user allowed to create category.');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Blocked: Regular user blocked with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    // --- Admin creates category ---
    console.log('Creating category as Admin...');
    const createCategoryRes = await axios.post(`${BASE_URL}/resources/categories`, { title: 'E2E Test Category' }, adminHeader);
    categoryId = createCategoryRes.data._id;
    console.log(`✅ Success: Admin created category (ID: ${categoryId}).`);

    // --- Admin creates resource ---
    console.log('Creating resource in category as Admin...');
    const resourcePayload = {
      title: 'E2E Test PDF Guide',
      category: categoryId,
      resourceType: 'pdf',
      previewLink: 'https://example.com/test.pdf',
      description: 'Study sheet description'
    };
    const createResourceRes = await axios.post(`${BASE_URL}/resources`, resourcePayload, adminHeader);
    resourceId = createResourceRes.data._id;
    console.log(`✅ Success: Admin created resource (ID: ${resourceId}).`);

    // --- User fetches resources (should succeed) ---
    console.log('Fetching resources as User...');
    const userResourceRes = await axios.get(`${BASE_URL}/resources`, userHeader);
    const resourceList = userResourceRes.data.resources; // Controller wraps list under { resources, page, pages, total }
    if (!Array.isArray(resourceList)) {
      throw new Error('FAIL: Resources response list wrapper not found.');
    }
    const foundResource = resourceList.find(r => r._id === resourceId);
    if (!foundResource) throw new Error('FAIL: Created resource not found in user list.');
    console.log(`✅ Success: User can access resources.`);

    // --- Clean up ---
    console.log('\n--- 🧹 Cleaning Up Test Entities ---');
    await Resource.deleteMany({ category: categoryId });
    await ResourceCategory.deleteOne({ _id: categoryId });
    await User.deleteOne({ _id: tempUserId });
    console.log('✅ Database cleaned up.');

    console.log('\n🌟 ALL RESOURCE AND RBAC TESTS PASSED SUCCESSFULLY! 🌟');

  } catch (err) {
    console.error('\n❌ Resource Test failed:', err.response ? err.response.data : err.message);
    try {
      if (categoryId) {
        await Resource.deleteMany({ category: categoryId });
        await ResourceCategory.deleteOne({ _id: categoryId });
      }
      await User.deleteOne({ email: testEmail });
    } catch {}
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    console.log('🏁 Resource Test complete.');
  }
};

runResourceTests();
