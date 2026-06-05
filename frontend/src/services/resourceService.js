import api from './api';

// Public - used on Home page (no auth needed)
export const getCategories = async () => {
  const response = await api.get('/api/resources/categories');
  return response.data;
};

// Admin - Create a new resource category
export const createCategory = async (data) => {
  const response = await api.post('/api/resources/categories', data);
  return response.data;
};

// Admin - Update an existing resource category
export const updateCategory = async (id, data) => {
  const response = await api.put(`/api/resources/categories/${id}`, data);
  return response.data;
};

// Admin - Delete a resource category
export const deleteCategory = async (id) => {
  const response = await api.delete(`/api/resources/categories/${id}`);
  return response.data;
};
