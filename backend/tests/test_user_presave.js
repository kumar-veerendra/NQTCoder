import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// ANSI escape codes for coloring
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

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
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}     NQTCoder User Model Pre-Save & Bcrypt Test     ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  const originalPassword = 'InitialSecretPassword123!';

  // ========================================
  // TEST 1: Initial User Registration (Password Modified = true)
  // =========================================
  console.log(`${YELLOW}--- Test 1: New User Creation / Registration ---${RESET}`);
  const user = new User({
    username: 'test_user_submit',
    email: 'test_submit@Mqtcoder.dev',
    password: originalPassword,
    submissionsCount: 0
  });

  assert(user.isModified('password') === true, 'New user password should be marked as modified');

  // Trigger pre-save middleware
  await new Promise((resolve, reject) => {
    user.schema.s.hooks.execPre('save', user, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const registeredHash = user.password;
  assert(registeredHash !== originalPassword, 'Password must be converted from plaintext to hash');
  assert(registeredHash.startsWith('$2'), 'Password hash must be in bcrypt format ($2a$/$2b$)');

  const matchInitial = await user.matchPassword(originalPassword);
  assert(matchInitial === true, 'matchPassword() must succeed for the registered plaintext password');

  const matchWrong = await user.matchPassword('WrongPassword!');
  assert(matchWrong === false, 'matchPassword() must fail for an incorrect password');

  // ==========================================
  // TEST 2: Case A — Password Unchanged (Submit Flow / Stats Update)
  // ==========================================
  console.log(`\n${YELLOW}--- Test 2: Case A — Password Unchanged (Submit / Stats Update) ---${RESET}`);
  const existingUser = User.hydrate({
    _id: user._id,
    username: user.username,
    email: user.email,
    password: registeredHash,
    submissionsCount: 0,
    solvedQuestions: [],
    solvedCount: { easy: 0, medium: 0, hard: 0 }
  });

  existingUser.submissionsCount += 1;
  existingUser.solvedCount.easy += 1;

  assert(existingUser.isModified('password') === false, 'isModified("password") must be FALSE when only stats are updated');
  assert(existingUser.isModified('submissionsCount') === true, 'isModified("submissionsCount") must be TRUE');

  const t0 = performance.now();
  await new Promise((resolve, reject) => {
    existingUser.schema.s.hooks.execPre('save', existingUser, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  const elapsedStatsSave = performance.now() - t0;

  assert(existingUser.password === registeredHash, 'Password hash must remain EXACTLY identical after stats save');
  assert(elapsedStatsSave < 5.0, `Pre-save hook execution must be near-instantaneous (took ${elapsedStatsSave.toFixed(3)} ms)`);

  const matchAfterStatsUpdate = await existingUser.matchPassword(originalPassword);
  assert(matchAfterStatsUpdate === true, 'Original password must STILL authenticate successfully after stats update (no password corruption)');

  // ==========================================
  // TEST 3: Case B — Password Changed (Password Reset Flow)
  // ==========================================
  console.log(`\n${YELLOW}--- Test 3: Case B — Password Changed (Password Reset Flow) ---${RESET}`);
  const newPassword = 'NewSecurePassword456!';
  existingUser.password = newPassword;

  assert(existingUser.isModified('password') === true, 'isModified("password") must be TRUE when password is updated');

  const t1 = performance.now();
  await new Promise((resolve, reject) => {
    existingUser.schema.s.hooks.execPre('save', existingUser, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  const elapsedPasswordChange = performance.now() - t1;

  const newHash = existingUser.password;
  assert(newHash !== registeredHash, 'New password hash must be different from previous hash');
  assert(newHash !== newPassword, 'New password must be hashed (not stored in plaintext)');
  assert(elapsedPasswordChange > 10.0, `Bcrypt hashing should have executed (took ${elapsedPasswordChange.toFixed(3)} ms)`);

  const matchNew = await existingUser.matchPassword(newPassword);
  assert(matchNew === true, 'matchPassword() must succeed for the NEW password');

  const matchOldAgainstNew = await existingUser.matchPassword(originalPassword);
  assert(matchOldAgainstNew === false, 'matchPassword() must fail for the OLD password after password change');

  // ==========================================
  // TEST 4: Quantitative Latency Benchmark (100 Stats Updates)
  // ==========================================
  console.log(`\n${YELLOW}--- Test 4: Quantitative Latency Benchmark (100 Stats Updates) ---${RESET}`);
  const benchUser = User.hydrate({
    _id: user._id,
    username: user.username,
    email: user.email,
    password: registeredHash,
    submissionsCount: 0
  });

  const runs = 100;
  const startFixed = performance.now();
  for (let i = 0; i < runs; i++) {
    benchUser.submissionsCount += 1;
    await new Promise((resolve) => {
      benchUser.schema.s.hooks.execPre('save', benchUser, () => resolve());
    });
  }
  const totalFixedMs = performance.now() - startFixed;
  const avgFixedMs = totalFixedMs / runs;

  const startUnfixed = performance.now();
  for (let i = 0; i < 5; i++) {
    const salt = await bcrypt.genSalt(10);
    await bcrypt.hash('samplepassword', salt);
  }
  const totalUnfixedSampleMs = performance.now() - startUnfixed;
  const avgUnfixedMs = totalUnfixedSampleMs / 5;

  console.log(`  [BENCHMARK] Fixed Pre-Save (return next):  ${avgFixedMs.toFixed(4)} ms per save`);
  console.log(`  [BENCHMARK] Unfixed Bcrypt re-hash:       ${avgUnfixedMs.toFixed(2)} ms per save`);
  console.log(`  [BENCHMARK] Latency saved per Submit:     ~${(avgUnfixedMs - avgFixedMs).toFixed(2)} ms of CPU block eliminated`);

  assert(avgFixedMs < 0.5, `Fixed pre-save average time (${avgFixedMs.toFixed(4)} ms) is < 0.5 ms`);

  console.log(`\n${BOLD}==================== Summary ========================${RESET}`);
  console.log(`Passed: ${GREEN}${passedTests}${RESET}`);
  console.log(`Failed: ${failedTests > 0 ? RED + failedTests : GREEN + failedTests}${RESET}`);
  console.log(`${BOLD}====================================================${RESET}\n`);

  if (failedTests > 0) process.exit(1);
  else process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
