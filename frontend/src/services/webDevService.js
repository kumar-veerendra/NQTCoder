import api from './api';

/**
 * Fetch all published web development questions with optional filters
 * @param {Object} params { difficulty, category, search }
 */
export const getWebDevQuestions = async (params = {}) => {
  const response = await api.get('/api/web-development/questions', { params });
  return response.data;
};

/**
 * Fetch single web dev question by ID or Slug
 * @param {string} idOrSlug 
 */
export const getWebDevQuestion = async (idOrSlug) => {
  const response = await api.get(`/api/web-development/questions/${idOrSlug}`);
  return response.data;
};
export const getPublicQuestionByIdOrSlug = getWebDevQuestion;

/**
 * Submit student solution for a web dev question
 * @param {string} questionId 
 * @param {Object} payload { htmlCode, cssCode, javascriptCode, testResults, timeSpent, startedAt }
 */
export const submitWebDevSolution = async (questionId, payload) => {
  const response = await api.post(`/api/web-development/questions/${questionId}/submit`, payload);
  return response.data;
};

/**
 * Get user submission history for a web dev question
 * @param {string} questionId 
 */
export const getWebDevSubmissions = async (questionId) => {
  const response = await api.get(`/api/web-development/questions/${questionId}/submissions`);
  return response.data;
};

/**
 * Admin: Get all web dev questions (including drafts)
 * @param {Object} params { status, search }
 */
export const getAdminWebDevQuestions = async (params = {}) => {
  const response = await api.get('/api/web-development/admin/questions', { params });
  return response.data;
};

/**
 * Admin: Get single question by ID for editor (includes solutionCode)
 * @param {string} id 
 */
export const getAdminWebDevQuestion = async (id) => {
  const response = await api.get(`/api/web-development/admin/questions/${id}`);
  return response.data;
};

/**
 * Admin: Create a new web dev question
 * @param {Object} payload 
 */
export const createAdminWebDevQuestion = async (payload) => {
  const response = await api.post('/api/web-development/admin/questions', payload);
  return response.data;
};

/**
 * Admin: Update an existing web dev question
 * @param {string} id 
 * @param {Object} payload 
 */
export const updateAdminWebDevQuestion = async (id, payload) => {
  const response = await api.patch(`/api/web-development/admin/questions/${id}`, payload);
  return response.data;
};

/**
 * Admin: Delete a web dev question
 * @param {string} id 
 */
export const deleteAdminWebDevQuestion = async (id) => {
  const response = await api.delete(`/api/web-development/admin/questions/${id}`);
  return response.data;
};
