import api from './api';

export const getQuestions = async (filters = {}) => {
  const params = {};
  if (filters.company) params.company = filters.company;
  if (filters.topic) params.topic = filters.topic;
  if (filters.difficulty) params.difficulty = filters.difficulty;

  const response = await api.get('/api/questions', { params });
  return response.data;
};

export const getQuestionById = async (id) => {
  const response = await api.get(`/api/questions/${id}`);
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await api.post('/api/questions', questionData);
  return response.data;
};

export const updateQuestion = async (id, questionData) => {
  const response = await api.put(`/api/questions/${id}`, questionData);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/api/questions/${id}`);
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/api/questions/admin/stats');
  return response.data;
};
