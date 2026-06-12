import api from './api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const pollJobStatus = async (jobId, onStatusChange) => {
  while (true) {
    let failed = false;
    let errorMsg = '';
    try {
      const response = await api.get(`/api/submissions/status/${jobId}`);
      const job = response.data;

      if (job.status === 'completed') {
        return job.result;
      }
      
      if (job.status === 'failed') {
        failed = true;
        errorMsg = job.error || 'Compilation or execution failed';
      }

      if (onStatusChange) {
        onStatusChange({
          status: job.status,
          position: job.position || 0,
          estimatedWait: job.estimatedWait || 0
        });
      }
    } catch (err) {
      // If network fails temporarily, we wait and retry instead of crashing
      console.warn('Temporary status polling error, retrying...', err);
    }

    if (failed) {
      throw new Error(errorMsg);
    }
    await sleep(1000);
  }
};

export const runCode = async (code, language, questionId, customInput = '', onStatusChange = null) => {
  const response = await api.post('/api/submissions/run', {
    code,
    language,
    questionId,
    customInput
  });

  const data = response.data;
  if (data.jobId) {
    if (onStatusChange) {
      onStatusChange({
        status: data.status,
        position: data.position || 0,
        estimatedWait: data.estimatedWait || 0
      });
    }
    return await pollJobStatus(data.jobId, onStatusChange);
  }

  return data;
};

export const submitCode = async (code, language, questionId, onStatusChange = null) => {
  const response = await api.post('/api/submissions/submit', {
    code,
    language,
    questionId
  });

  const data = response.data;
  if (data.jobId) {
    if (onStatusChange) {
      onStatusChange({
        status: data.status,
        position: data.position || 0,
        estimatedWait: data.estimatedWait || 0
      });
    }
    return await pollJobStatus(data.jobId, onStatusChange);
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
