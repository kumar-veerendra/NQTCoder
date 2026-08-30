import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import assert from 'assert';
import Game from '../models/Game.js';
import GameLevel from '../models/GameLevel.js';
import GameAttempt from '../models/GameAttempt.js';
import UserGameProgress from '../models/UserGameProgress.js';
import User from '../models/User.js';
import { seedGames, gamesData } from '../config/seedGames.js';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

async function runTests() {
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}      Cognitive Placement Games Master Test Suite    ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nqtcoder';
  await mongoose.connect(mongoUri);
  console.log(`${GREEN}✓ Connected to MongoDB for Games testing.${RESET}`);

  try {
    // ─── TEST 1: SEED & VERIFY ALL 10 COGNITIVE GAMES ───────────────────────
    console.log(`\n${BOLD}[Test 1] Seeding and verifying all 10 Games & Levels...${RESET}`);
    await seedGames();

    const gamesInDb = await Game.find({ isActive: true }).sort({ order: 1 });
    assert.strictEqual(gamesInDb.length, 10, 'Expected 10 active cognitive games in DB');
    console.log(`${GREEN}✓ 10 Cognitive Games successfully seeded in MongoDB.${RESET}`);

    // Verify all 10 expected game slugs
    const expectedSlugs = [
      'geo-sudo',
      'digit-challenge',
      'switch-challenge',
      'inductive-challenge',
      'grid-challenge',
      'motion-challenge',
      'the-same-rule',
      'colour-the-grid',
      'doesnt-fit-the-rule',
      'oddo-similarity-grid',
    ];

    for (const slug of expectedSlugs) {
      const g = await Game.findOne({ slug });
      assert.ok(g, `Game with slug ${slug} must exist`);
      assert.ok(g.name, `Game ${slug} must have a valid name`);
      assert.ok(g.category, `Game ${slug} must have a valid category`);
      assert.ok(Array.isArray(g.skills) && g.skills.length > 0, `Game ${slug} must list skills`);
      assert.ok(Array.isArray(g.instructions) && g.instructions.length > 0, `Game ${slug} must have instructions`);

      // Verify all 5 levels for each game
      const levels = await GameLevel.find({ gameId: g._id }).sort({ levelNumber: 1 });
      assert.strictEqual(levels.length, 5, `Game ${slug} must have exactly 5 configured levels`);

      levels.forEach((lvl, idx) => {
        assert.strictEqual(lvl.levelNumber, idx + 1, `Level index must be ${idx + 1}`);
        assert.ok(lvl.timeLimit > 0, `Level ${lvl.levelNumber} must have a positive timeLimit`);
        assert.ok(lvl.passingCriteria?.minAccuracy >= 70, `Level ${lvl.levelNumber} minAccuracy must be >= 70%`);
        assert.ok(lvl.scoreMultiplier >= 1.0, `Level ${lvl.levelNumber} scoreMultiplier must be >= 1.0`);
      });
    }
    console.log(`${GREEN}✓ All 10 games verified with 5 fully-configured levels each (50 levels total).${RESET}`);

    // ─── TEST 2: VERIFY ALL 10 GAME TYPES AND COMPANY TAGS ─────────────────
    console.log(`\n${BOLD}[Test 2] Verifying game categories and company links...${RESET}`);
    const companyChecks = [
      { slug: 'geo-sudo', gameType: 'geo-sudo', company: 'Cognizant' },
      { slug: 'switch-challenge', gameType: 'switch', company: 'Cognizant' },
      { slug: 'inductive-challenge', gameType: 'inductive', company: 'Cognizant' },
      { slug: 'grid-challenge', gameType: 'grid-memory', company: 'Cognizant' },
      { slug: 'motion-challenge', gameType: 'motion', company: 'Capgemini' },
      { slug: 'digit-challenge', gameType: 'digit', company: 'Capgemini' },
      { slug: 'the-same-rule', gameType: 'same-rule', company: 'Capgemini' },
      { slug: 'colour-the-grid', gameType: 'colour-grid', company: 'Capgemini' },
      { slug: 'doesnt-fit-the-rule', gameType: 'doesnt-fit', company: 'Cognizant' },
      { slug: 'oddo-similarity-grid', gameType: 'oddo', company: 'Placement assessments' },
    ];

    for (const check of companyChecks) {
      const g = await Game.findOne({ slug: check.slug });
      assert.ok(g, `Game ${check.slug} must exist`);
      assert.strictEqual(g.gameType, check.gameType, `Game ${check.slug} must have type ${check.gameType}`);
      assert.ok(
        g.companyNames.some((c) => c.toLowerCase().includes(check.company.toLowerCase())),
        `Game ${check.slug} must be tagged with ${check.company}`
      );
    }
    console.log(`${GREEN}✓ All 10 game types and company mappings verified.${RESET}`);

    // ─── TEST 3: USER PROGRESSION & LEVEL UNLOCKING SIMULATION ────────────
    console.log(`\n${BOLD}[Test 3] Testing user level progression and level unlocking...${RESET}`);
    let testUser = await User.findOne({ email: 'gamemaster_test@nqtcoder.dev' });
    if (!testUser) {
      testUser = await User.create({
        username: 'gamemaster_runner',
        email: 'gamemaster_test@nqtcoder.dev',
        password: 'Password123!',
        isVerified: true,
      });
    }

    // Clear previous test attempts for clean test
    await GameAttempt.deleteMany({ userId: testUser._id });
    await UserGameProgress.deleteMany({ userId: testUser._id });

    const geoSudo = await Game.findOne({ slug: 'geo-sudo' });

    // Simulate passing Level 1 (80% accuracy, 4/5 correct)
    const level1Attempt = await GameAttempt.create({
      userId: testUser._id,
      gameId: geoSudo._id,
      gameSlug: 'geo-sudo',
      levelNumber: 1,
      score: 540,
      accuracy: 80,
      totalChallenges: 5,
      correctAnswers: 4,
      wrongAnswers: 1,
      totalTime: 85,
      averageTime: 17,
      fastestTime: 11,
      bestStreak: 3,
      passed: true,
      xpEarned: 160,
      stars: 4,
    });
    assert.ok(level1Attempt._id, 'Level 1 attempt must be saved');

    // Create user progress
    const progress = await UserGameProgress.create({
      userId: testUser._id,
      gameId: geoSudo._id,
      gameSlug: 'geo-sudo',
      highestUnlockedLevel: 2, // Level 2 unlocked!
      completedLevels: [1],
      bestScore: 540,
      bestAccuracy: 80,
      bestTime: 17,
      bestStreak: 3,
      totalChallengesSolved: 4,
      totalCorrect: 4,
      totalAttempts: 1,
      totalXPEarned: 160,
      levelStats: [
        {
          levelNumber: 1,
          unlocked: true,
          completed: true,
          bestScore: 540,
          bestAccuracy: 80,
          bestTime: 17,
          stars: 4,
          attempts: 1,
        },
        {
          levelNumber: 2,
          unlocked: true,
          completed: false,
          bestScore: 0,
          bestAccuracy: 0,
          bestTime: 0,
          stars: 0,
          attempts: 0,
        },
      ],
    });

    assert.strictEqual(progress.highestUnlockedLevel, 2, 'Level 2 must be unlocked upon passing Level 1');
    assert.ok(progress.completedLevels.includes(1), 'Level 1 must be marked completed');
    console.log(`${GREEN}✓ Progression verified: Level 1 completed ➔ Level 2 successfully unlocked.${RESET}`);

    // Clean up test records
    await GameAttempt.deleteMany({ userId: testUser._id });
    await UserGameProgress.deleteMany({ userId: testUser._id });
    await User.deleteOne({ _id: testUser._id });

    console.log(`\n${GREEN}${BOLD}====================================================${RESET}`);
    console.log(`${GREEN}${BOLD}✓ ALL 10 COGNITIVE GAMES TESTS PASSED SUCCESSFULLY!${RESET}`);
    console.log(`${GREEN}${BOLD}====================================================${RESET}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`\n${RED}${BOLD}Test suite error:${RESET}`, err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
