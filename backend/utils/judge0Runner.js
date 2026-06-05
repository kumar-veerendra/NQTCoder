import axios from 'axios';

// Map our language strings to Judge0 Language IDs
const LANGUAGE_IDS = {
  'cpp': 54,     // C++ (GCC 9.2.0)
  'java': 62,    // Java (OpenJDK 13.0.1)
  'python': 71   // Python (3.8.1)
};

/**
 * Base64 helper utilities
 */
const toBase64 = (str) => Buffer.from(str || '').toString('base64');
const fromBase64 = (str) => Buffer.from(str || '', 'base64').toString('utf-8');

/**
 * Submit and execute code via Judge0
 */
export const runJudge0Code = async (code, language, input, timeLimit = 2) => {
  const languageId = LANGUAGE_IDS[language] || 71; // Default python
  const apiUrl = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
  const apiKey = process.env.JUDGE0_API_KEY;

  const headers = {};
  if (apiKey) {
    // If using RapidAPI
    if (apiUrl.includes('rapidapi.com')) {
      headers['x-rapidapi-key'] = apiKey;
      headers['x-rapidapi-host'] = apiUrl.replace('https://', '').split('/')[0];
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  try {
    // 1. Submit code
    const submissionBody = {
      source_code: toBase64(code),
      language_id: languageId,
      stdin: toBase64(input),
      cpu_time_limit: timeLimit
    };

    const submitRes = await axios.post(
      `${apiUrl}/submissions?base64_encoded=true&wait=false`,
      submissionBody,
      { headers }
    );

    const { token } = submitRes.data;
    if (!token) {
      throw new Error('Failed to get submission token from Judge0');
    }

    // 2. Poll for results
    let maxPolls = 15;
    let pollInterval = 1000; // 1s
    
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((r) => setTimeout(r, pollInterval));

      const pollRes = await axios.get(
        `${apiUrl}/submissions/${token}?base64_encoded=true`,
        { headers }
      );

      const statusId = pollRes.data.status?.id;

      // Status ID 1: In Queue, 2: Processing
      if (statusId === 1 || statusId === 2) {
        continue;
      }

      // Execution finished
      const data = pollRes.data;
      const stdout = fromBase64(data.stdout);
      const compileOutput = fromBase64(data.compile_output);
      const stderr = fromBase64(data.stderr);
      const statusDescription = data.status?.description || '';

      let status = 'Accepted';
      let error = stderr || compileOutput || '';

      if (statusId === 3) {
        status = 'Accepted';
      } else if (statusId === 4) {
        status = 'Wrong Answer';
      } else if (statusId === 5) {
        status = 'Time Limit Exceeded';
      } else if (statusId === 6) {
        status = 'Compilation Error';
        error = compileOutput || stderr;
      } else {
        // Runtime Errors, etc.
        status = 'Runtime Error';
      }

      return {
        status,
        stdout,
        error
      };
    }

    return {
      status: 'Time Limit Exceeded',
      stdout: '',
      error: 'Polling timeout exceeded while waiting for compiler.'
    };

  } catch (err) {
    console.error('Judge0 Error:', err.message);
    return {
      status: 'Runtime Error',
      stdout: '',
      error: `Compiler API Error: ${err.message}`
    };
  }
};
