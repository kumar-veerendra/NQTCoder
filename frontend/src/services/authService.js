import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (username, email, password, confirmPassword) => {
  const response = await api.post('/api/auth/register', {
    username,
    email,
    password,
    confirmPassword
  });
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await api.post('/api/auth/google', { credential });
  return response.data;
};

export const verifyEmail = async (email, code) => {
  const response = await api.post('/api/auth/verify', { email, code });
  return response.data;
};

export const resendCode = async (email) => {
  const response = await api.post('/api/auth/resend-code', { email });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/api/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/api/auth/profile', profileData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email, code, newPassword) => {
  const response = await api.post('/api/auth/reset-password', { email, code, newPassword });
  return response.data;
};
