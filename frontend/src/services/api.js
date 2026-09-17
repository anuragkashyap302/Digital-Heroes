import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dh_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalized error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    const status = error.response?.status;

    if (status === 401 && window.location.pathname.startsWith('/dashboard')) {
      localStorage.removeItem('dh_token');
      localStorage.removeItem('dh_user');
      window.location.href = '/login?expired=true';
    }

    return Promise.reject({
      status,
      message,
      error: error.response?.data?.error || 'ApiError',
      original: error
    });
  }
);
