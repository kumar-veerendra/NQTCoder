import api from './api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const pollMockJobStatus = async (jobId) => {
  while (true) {
    let failed = false;
    let errorMsg = '';
    try {
      const response = await api.get(`/api/submissions/status/${jobId}`);
      const job = response.data;

      if (job.status === 'completed') {
        return job.result; // This will return the updated MockTest document
      }
      
      if (job.status === 'failed') {
        failed = true;
        errorMsg = job.error || 'Mock test submission run failed';
      }
    } catch (err) {
      console.warn('Temporary status polling error for mock test, retrying...', err);
    }

    if (failed) {
      throw new Error(errorMsg);
    }
    await sleep(1000);
  }
};

export const startMockTest = async () => {
  const response = await api.post('/api/mocktests/start');
  return response.data;
};

export const getCurrentMockTest = async () => {
  const response = await api.get('/api/mocktests/current');
  return response.data;
};

export const submitMockTestQuestion = async (mockTestId, questionNumber, code, language, timeSpent) => {
  const response = await api.post(`/api/mocktests/${mockTestId}/submit`, {
    questionNumber,
    code,
    language,
    timeSpent
  });

  const data = response.data;
  if (data.jobId) {
    return await pollMockJobStatus(data.jobId);
  }
  return data;
};

export const recordMockTestViolation = async (mockTestId) => {
  const response = await api.post(`/api/mocktests/${mockTestId}/violation`);
  return response.data;
};

export const getMockTestHistory = async () => {
  const response = await api.get('/api/mocktests/history');
  return response.data;
};
