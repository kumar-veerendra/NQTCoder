/**
 * E-mail validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Strong password criteria:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateRegister = (data) => {
  const errors = {};

  if (!data.username || data.username.trim() === '') {
    errors.username = 'Username is required';
  } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(data.username)) {
    errors.username = 'Username must be 3-20 characters [a-z, 0-9, _, -] with no spaces.';
  }

  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!PASSWORD_REGEX.test(data.password)) {
    errors.password = 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a digit, and a special character (@$!%*?&)';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

export const validateLogin = (data) => {
  const errors = {};

  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

export const validateQuestion = (data) => {
  const errors = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = 'Question title is required';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = 'Question description is required';
  }

  if (!data.company || (Array.isArray(data.company) && data.company.length === 0)) {
    errors.company = 'At least one company tag is required';
  }

  if (!data.difficulty || !['Easy', 'Easy-Medium', 'Medium', 'Medium-Hard', 'Hard'].includes(data.difficulty)) {
    errors.difficulty = 'Difficulty must be Easy, Easy-Medium, Medium, Medium-Hard, or Hard';
  }

  if (!data.topic || data.topic.trim() === '') {
    errors.topic = 'Topic category is required';
  }

  if (!data.visibleTestCases || !Array.isArray(data.visibleTestCases) || data.visibleTestCases.length === 0) {
    errors.visibleTestCases = 'At least one visible test case is required';
  }

  if (!data.hiddenTestCases || !Array.isArray(data.hiddenTestCases) || data.hiddenTestCases.length === 0) {
    errors.hiddenTestCases = 'At least one hidden testcase is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
