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
