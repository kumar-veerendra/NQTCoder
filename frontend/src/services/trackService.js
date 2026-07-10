import api from './api';

export const getTracks = async () => {
  const response = await api.get('/api/tracks');
  return response.data;
};

export const getTrackById = async (id) => {
  const response = await api.get(`/api/tracks/${id}`);
  return response.data;
};

export const createTrack = async (trackData) => {
  const response = await api.post('/api/tracks', trackData);
  return response.data;
};

export const updateTrack = async (id, trackData) => {
  const response = await api.put(`/api/tracks/${id}`, trackData);
  return response.data;
};

export const deleteTrack = async (id) => {
  const response = await api.delete(`/api/tracks/${id}`);
  return response.data;
};

export const updateTrackLastAccessed = async (id, questionId) => {
  const response = await api.post(`/api/tracks/${id}/access`, { questionId });
  return response.data;
};

export const resetTrack = async (id) => {
  const response = await api.post(`/api/tracks/${id}/reset`);
  return response.data;
};
