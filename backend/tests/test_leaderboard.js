import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';

// ANSI escape codes for coloring
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function runLeaderboardTests() {
  console.log(`${BOLD}🏁 Starting Leaderboard Rank & Tie-Breaker Validation Suite...${RESET}`);

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Cleanup previous testers
    await User.deleteMany({ email: /leaderboard_tester_.*@example\.com/ });

    // 1. Create Mock Users
    // User C: Solved 6 questions, 15 submissions (Should rank 1st)
    const userC = await User.create({
      username: 'leaderboard_tester_c',
      email: 'leaderboard_tester_c@example.com',
      password: 'Password@123',
      isVerified: true,
      solvedQuestions: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ],
      submissionsCount: 15
    });

    // User B: Solved 5 questions, 8 submissions (Should rank 2nd - tie-breaker win on fewer attempts)
    const userB = await User.create({
      username: 'leaderboard_tester_b',
      email: 'leaderboard_tester_b@example.com',
      password: 'Password@123',
      isVerified: true,
      solvedQuestions: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ],
      submissionsCount: 8
    });

    // User A: Solved 5 questions, 12 submissions (Should rank 3rd - tie-breaker loss on more attempts)
    const userA = await User.create({
      username: 'leaderboard_tester_a',
      email: 'leaderboard_tester_a@example.com',
      password: 'Password@123',
      isVerified: true,
      solvedQuestions: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ],
      submissionsCount: 12
    });

    // User Admin: Solved 10 questions (Should be excluded from leaderboard)
    const userAdmin = await User.create({
      username: 'leaderboard_tester_admin',
      email: 'leaderboard_tester_admin@example.com',
      password: 'Password@123',
      isVerified: true,
      role: 'admin',
      solvedQuestions: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ],
      submissionsCount: 2
    });

    // User Unverified: Solved 10 questions (Should be excluded from leaderboard since isVerified is false)
    const userUnverified = await User.create({
      username: 'leaderboard_tester_unverified',
      email: 'leaderboard_tester_unverified@example.com',
      password: 'Password@123',
      isVerified: false,
      solvedQuestions: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ],
      submissionsCount: 5
    });

    console.log('✅ Mock users seeded successfully.');

    // 2. Fetch Leaderboard (Using aggregation pipeline from controller)
    const rankings = await User.aggregate([
      {
        $match: { 
          role: { $ne: 'admin' },
          isVerified: true
        }
      },
      {
        $project: {
          username: 1,
          email: 1,
          submissionsCount: 1,
          solvedQuestionsCount: { $size: "$solvedQuestions" }
        }
      },
      { $sort: { solvedQuestionsCount: -1, submissionsCount: 1 } },
      { $limit: 100 }
    ]);

    // 3. Assertions
    // Filter leaderboard to our test users
    const filteredRankings = rankings.filter(u => u.email.startsWith('leaderboard_tester_'));
    console.log('Rankings Result:', filteredRankings.map(u => ({
      username: u.username,
      solvedCount: u.solvedQuestionsCount,
      attempts: u.submissionsCount
    })));

    // Verify Admin is excluded
    const adminInLeaderboard = filteredRankings.some(u => u.username === 'leaderboard_tester_admin');
    if (adminInLeaderboard) {
      throw new Error('FAIL: Administrator was not excluded from rankings.');
    }
    console.log(`${GREEN}✓ Passed: Administrator successfully excluded from leaderboard.${RESET}`);

    // Verify Unverified User is excluded
    const unverifiedInLeaderboard = filteredRankings.some(u => u.username === 'leaderboard_tester_unverified');
    if (unverifiedInLeaderboard) {
      throw new Error('FAIL: Unverified user was not excluded from rankings.');
    }
    console.log(`${GREEN}✓ Passed: Unverified user successfully excluded from leaderboard.${RESET}`);

    // Verify Rank 1 is User C (solved 6)
    if (filteredRankings[0].username !== 'leaderboard_tester_c') {
      throw new Error(`FAIL: Expected Rank 1 to be leaderboard_tester_c, got ${filteredRankings[0].username}`);
    }
    console.log(`${GREEN}✓ Passed: User C correctly ranked #1 (most solved questions).${RESET}`);

    // Verify Rank 2 is User B (solved 5, 8 attempts) vs User A (solved 5, 12 attempts)
    if (filteredRankings[1].username !== 'leaderboard_tester_b') {
      throw new Error(`FAIL: Expected Rank 2 to be leaderboard_tester_b, got ${filteredRankings[1].username}`);
    }
    console.log(`${GREEN}✓ Passed: User B correctly ranked #2 (won tie-breaker on fewer submissions).${RESET}`);

    if (filteredRankings[2].username !== 'leaderboard_tester_a') {
      throw new Error(`FAIL: Expected Rank 3 to be leaderboard_tester_a, got ${filteredRankings[2].username}`);
    }
    console.log(`${GREEN}✓ Passed: User A correctly ranked #3 (lost tie-breaker on more submissions).${RESET}`);

    // Clean up
    await User.deleteMany({ email: /leaderboard_tester_.*@example\.com/ });
    console.log('🧹 Cleanup completed.');

    console.log(`\n${GREEN}${BOLD}🎉 ALL LEADERBOARD RANKING TESTS PASSED SUCCESSFULLY!${RESET}`);

  } catch (error) {
    console.error(`\n${RED}❌ Leaderboard Test Suite Failed: ${error.message}${RESET}`);
    // Attempt cleanup even on failure
    try {
      await User.deleteMany({ email: /leaderboard_tester_.*@example\.com/ });
    } catch {}
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 Closed database connection.');
    }
  }
}

runLeaderboardTests();
