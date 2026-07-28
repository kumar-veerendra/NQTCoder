import api from './api';

export const getSyllabusTopics = async () => {
  const response = await api.get('/api/practice/topics');
  return response.data;
};

export const getPracticeProgress = async () => {
  const response = await api.get('/api/practice/progress');
  return response.data;
};

export const startPracticeSession = async (payload) => {
  const response = await api.post('/api/practice/sessions', payload);
  return response.data;
};

export const getPracticeQuestions = async (filters = {}) => {
  const params = {};
  if (filters.section) params.section = filters.section;
  if (filters.topic) params.topic = filters.topic;
  if (filters.difficulty) params.difficulty = filters.difficulty;
  if (filters.search) params.search = filters.search;
  if (filters.skill) params.skill = filters.skill;

  const response = await api.get('/api/practice/questions', { params });
  return response.data;
};

export const getPracticeQuestionById = async (id) => {
  const response = await api.get(`/api/practice/questions/${id}`);
  return response.data;
};

export const submitPracticeAnswer = async (id, payload) => {
  // payload: { submittedAnswer: Array, timeTakenSec: Number, sessionId: String }
  const response = await api.post(`/api/practice/questions/${id}/submit`, payload);
  return response.data;
};

export const toggleBookmark = async (questionId) => {
  const response = await api.post(`/api/practice/questions/${questionId}/bookmark`);
  return response.data;
};

export const getBookmarks = async () => {
  const response = await api.get('/api/practice/bookmarks');
  return response.data;
};

export const getRevisionQueue = async () => {
  const response = await api.get('/api/practice/revision-queue');
  return response.data;
};

export const getPracticeQuota = async () => {
  const response = await api.get('/api/practice/quota');
  return response.data;
};

export const getQuestionDraft = async (questionId) => {
  const response = await api.get(`/api/practice/drafts/${questionId}`);
  return response.data;
};

export const saveQuestionDraft = async (questionId, payload) => {
  const response = await api.post(`/api/practice/drafts/${questionId}`, payload);
  return response.data;
};

export const deleteQuestionDraft = async (questionId) => {
  const response = await api.delete(`/api/practice/drafts/${questionId}`);
  return response.data;
};

export const generateAIQuestion = async (payload) => {
  const response = await api.post('/api/practice/questions/generate-ai', payload);
  return response.data;
};

export const generateCustomScenario = async (payload) => {
  const response = await api.post('/api/practice/questions/custom-scenario', payload);
  return response.data;
};

export const getAICoachImprovements = async (payload) => {
  const qId = payload.questionId || payload.attemptId || 'improve';
  const response = await api.post(`/api/practice/questions/${qId}/improve`, payload);
  return response.data;
};

export const getAttemptAIStatus = async (attemptId) => {
  const response = await api.get(`/api/practice/attempts/${attemptId}/ai-status`);
  return response.data;
};
