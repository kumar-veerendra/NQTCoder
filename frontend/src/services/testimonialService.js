import api from './api';

/**
 * Fetch approved public testimonials for the homepage carousel
 * @param {Object} params { limit, sortBy }
 */
export const getApprovedTestimonials = async (params = {}) => {
  const response = await api.get('/api/testimonials', { params });
  return response.data;
};

/**
 * Fetch current user's submitted testimonial (if any)
 */
export const getMyTestimonial = async () => {
  const response = await api.get('/api/testimonials/my');
  return response.data;
};

/**
 * Submit or update user testimonial
 * @param {Object} data { rating, review, wouldRecommend, usageAreas }
 */
export const submitTestimonial = async (data) => {
  const response = await api.post('/api/testimonials', data);
  return response.data;
};

/**
 * Admin: Get all testimonials with optional filtering
 * @param {Object} params { status, search }
 */
export const getAdminTestimonials = async (params = {}) => {
  const response = await api.get('/api/testimonials/admin', { params });
  return response.data;
};

/**
 * Admin: Moderate a testimonial (Approve, Reject, Hide, Feature, Note)
 * @param {string} id 
 * @param {Object} data { status, isFeatured, adminNote }
 */
export const updateTestimonialStatus = async (id, data) => {
  const response = await api.patch(`/api/testimonials/admin/${id}`, data);
  return response.data;
};

/**
 * Admin: Delete a testimonial
 * @param {string} id 
 */
export const deleteTestimonial = async (id) => {
  const response = await api.delete(`/api/testimonials/admin/${id}`);
  return response.data;
};
