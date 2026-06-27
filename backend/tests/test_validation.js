import { validateRegister, validateLogin } from '../utils/validator.js';

// ANSI escape codes for coloring
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}====================================================${RESET}`);
console.log(`${BOLD}       NQTCoder Registration & Login Validation Test ${RESET}`);
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

// ==========================================
// 1. REGISTER VALIDATION TESTS
// ==========================================
console.log(`${YELLOW}--- Testing validateRegister ---${RESET}`);

// Test 1.1: Valid Registration
const validRegData = {
  username: 'valid_coder-12',
  email: 'valid.coder@example.com',
  password: 'Password@123',
  confirmPassword: 'Password@123'
};
const res1 = validateRegister(validRegData);
assert(res1.isValid === true, 'Valid registration data should be valid');
assert(Object.keys(res1.errors).length === 0, 'Valid registration should have no errors');

// Test 1.2: Username with spaces
const spacedUsername = {
  username: 'invalid coder',
  email: 'coder@example.com',
  password: 'Password@123',
  confirmPassword: 'Password@123'
};
const res2 = validateRegister(spacedUsername);
assert(res2.isValid === false, 'Username with space should be invalid');
assert(res2.errors.username === 'Username must be 3-20 characters [a-z, 0-9, _, -] with no spaces.', `Username space error message: "${res2.errors.username}"`);

// Test 1.3: Username too short
const shortUsername = {
  username: 'co',
  email: 'coder@example.com',
  password: 'Password@123',
  confirmPassword: 'Password@123'
};
const res3 = validateRegister(shortUsername);
assert(res3.isValid === false, 'Username < 3 characters should be invalid');
assert(res3.errors.username !== undefined, 'Short username should produce a username error');

// Test 1.4: Username too long
const longUsername = {
  username: 'a'.repeat(21),
  email: 'coder@example.com',
  password: 'Password@123',
  confirmPassword: 'Password@123'
};
const res4 = validateRegister(longUsername);
assert(res4.isValid === false, 'Username > 20 characters should be invalid');
assert(res4.errors.username !== undefined, 'Long username should produce a username error');

// Test 1.5: Invalid Characters in Username
const invalidCharUsername = {
  username: 'coder$',
  email: 'coder@example.com',
  password: 'Password@123',
  confirmPassword: 'Password@123'
};
const res5 = validateRegister(invalidCharUsername);
assert(res5.isValid === false, 'Username with invalid characters ($) should be invalid');
assert(res5.errors.username !== undefined, 'Invalid character username should produce a username error');

// Test 1.6: Invalid Email Address
const invalidEmail = {
  username: 'validcoder',
  email: 'invalidemail.com',
  password: 'Password@123',
  confirmPassword: 'Password@123'
};
const res6 = validateRegister(invalidEmail);
assert(res6.isValid === false, 'Invalid email format should be invalid');
assert(res6.errors.email === 'Please provide a valid email address', 'Invalid email message check');

// Test 1.7: Invalid/Weak Password
const weakPassword = {
  username: 'validcoder',
  email: 'coder@example.com',
  password: 'simplepassword',
  confirmPassword: 'simplepassword'
};
const res7 = validateRegister(weakPassword);
assert(res7.isValid === false, 'Weak password should be invalid');
assert(res7.errors.password !== undefined, 'Weak password should produce a password error');

// Test 1.8: Password Mismatch
const passwordMismatch = {
  username: 'validcoder',
  email: 'coder@example.com',
  password: 'Password@123',
  confirmPassword: 'DifferentPassword@123'
};
const res8 = validateRegister(passwordMismatch);
assert(res8.isValid === false, 'Password mismatch should be invalid');
assert(res8.errors.confirmPassword === 'Passwords do not match', 'Password mismatch error message check');


// ==========================================
// 2. LOGIN VALIDATION TESTS
// ==========================================
console.log(`\n${YELLOW}--- Testing validateLogin ---${RESET}`);

// Test 2.1: Valid Login
const validLoginData = {
  email: 'coder@example.com',
  password: 'Password@123'
};
const loginRes1 = validateLogin(validLoginData);
assert(loginRes1.isValid === true, 'Valid login data should be valid');
assert(Object.keys(loginRes1.errors).length === 0, 'Valid login should have no errors');

// Test 2.2: Invalid Login Email
const invalidLoginEmail = {
  email: 'not-an-email',
  password: 'Password@123'
};
const loginRes2 = validateLogin(invalidLoginEmail);
assert(loginRes2.isValid === false, 'Invalid login email format should be invalid');
assert(loginRes2.errors.email === 'Please provide a valid email address', 'Invalid login email message check');

// Test 2.3: Empty Login Password
const emptyLoginPassword = {
  email: 'coder@example.com',
  password: ''
};
const loginRes3 = validateLogin(emptyLoginPassword);
assert(loginRes3.isValid === false, 'Empty login password should be invalid');
assert(loginRes3.errors.password === 'Password is required', 'Empty login password error message check');


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
