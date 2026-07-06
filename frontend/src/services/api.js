import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]') {
      return ''; // Use Vite dev proxy
    }
  }
  return import.meta.env.VITE_API_URL || '';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Interceptor to inject JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo') 
      ? JSON.parse(localStorage.getItem('userInfo')) 
      : null;
      
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to catch 401 Unauthorized and redirect to login
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      // Don't force-redirect guests on public-browsable pages
      const isPublicBrowsable = path.startsWith('/aptitude');
      if (
        typeof window !== 'undefined' &&
        !isPublicBrowsable &&
        !path.startsWith('/login') &&
        !path.startsWith('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
