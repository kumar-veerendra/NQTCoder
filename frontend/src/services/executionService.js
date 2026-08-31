import api from './api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ADAPTIVE_POLL_INTERVALS = [0, 150, 250, 400, 600, 1000];
const MAX_POLL_TIMEOUT_MS = 60000; // 60s hard timeout
const MAX_CONSECUTIVE_ERRORS = 5;

export const pollJobStatus = async (jobId, onStatusChange, options = {}) => {
  const startTime = Date.now();
  let pollCount = 0;
  let consecutiveErrors = 0;

  while (true) {
    // Check if component unmounted or request was cancelled
    if (options.signal?.aborted) {
      throw new Error('Execution polling cancelled');
    }

    // Check hard timeout
    if (Date.now() - startTime > MAX_POLL_TIMEOUT_MS) {
      throw new Error(`Execution timed out waiting for job ${jobId}`);
    }

    // Determine current polling delay
    const delay = pollCount < ADAPTIVE_POLL_INTERVALS.length
      ? ADAPTIVE_POLL_INTERVALS[pollCount]
      : 1000;

    if (delay > 0) {
      await sleep(delay);
    }
    pollCount++;

    if (options.signal?.aborted) {
      throw new Error('Execution polling cancelled');
    }

    try {
      const response = await api.get(`/api/submissions/status/${jobId}`, {
        signal: options.signal
      });
      consecutiveErrors = 0;
      const job = response.data;

      if (job.status === 'completed') {
        return job.result;
      }
      
      if (job.status === 'failed') {
        throw new Error(job.error || 'Compilation or execution failed');
      }

      if (onStatusChange) {
        onStatusChange({
          status: job.status,
          position: job.position || 0,
          estimatedWait: job.estimatedWait || 0
        });
      }
    } catch (err) {
      if (options.signal?.aborted) {
        throw new Error('Execution polling cancelled');
      }
      // If error was thrown from failed status, rethrow
      if (err.message && (err.message.includes('Compilation or execution failed') || err.message.startsWith('Time limit'))) {
        throw err;
      }
      consecutiveErrors++;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        throw new Error('Network communication with compiler service failed. Please try again.');
      }
      console.warn(`Temporary status polling error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}), retrying...`, err);
    }
  }
};

export const runCode = async (code, language, questionId, customInput = '', onStatusChange = null, options = {}) => {
  const response = await api.post('/api/submissions/run', {
    code,
    language,
    questionId,
    customInput
  }, { signal: options.signal });

  const data = response.data;
  if (data.jobId) {
    if (onStatusChange) {
      onStatusChange({
        status: data.status,
        position: data.position || 0,
        estimatedWait: data.estimatedWait || 0
      });
    }
    return await pollJobStatus(data.jobId, onStatusChange, options);
  }

  return data;
};

export const submitCode = async (code, language, questionId, onStatusChange = null, options = {}) => {
  const response = await api.post('/api/submissions/submit', {
    code,
    language,
    questionId
  }, { signal: options.signal });

  const data = response.data;
  if (data.jobId) {
    if (onStatusChange) {
      onStatusChange({
        status: data.status,
        position: data.position || 0,
        estimatedWait: data.estimatedWait || 0
      });
    }
    return await pollJobStatus(data.jobId, onStatusChange, options);
  }

  return data;
};

export const getSubmissions = async (questionId) => {
  const response = await api.get(`/api/submissions/question/${questionId}`);
  return response.data;
};

export const getUserSubmissions = async () => {
  const response = await api.get('/api/submissions/user');
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/api/leaderboard');
  return response.data;
};

export const getCompilersStatus = async () => {
  const response = await api.get('/api/submissions/compilers');
  return response.data;
};
