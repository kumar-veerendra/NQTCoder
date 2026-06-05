import api from './api';

export const submitFeedback = async (feedbackData) => {
  const response = await api.post('/api/feedback', feedbackData);
  return response.data;
};

export const getAllFeedback = async () => {
  const response = await api.get('/api/feedback');
  return response.data;
};

export const updateFeedbackStatus = async (id, status) => {
  const response = await api.patch(`/api/feedback/${id}`, { status });
  return response.data;
};

export const deleteFeedback = async (id) => {
  const response = await api.delete(`/api/feedback/${id}`);
  return response.data;
};
