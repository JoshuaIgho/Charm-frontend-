import axios from 'axios';

// ✅ GraphQL API URL for Keystone backend
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/graphql';

// ✅ REST API URL (if you have REST endpoints)
const REST_API_URL = import.meta.env.VITE_REST_API_URL || 'http://localhost:4000';

// Create axios instance with default config for REST endpoints
const api = axios.create({
  baseURL: REST_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Public routes that must NOT have Authorization header
    const publicRoutes = [
      '/auth/register',
      '/auth/login',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/admin/login',
      '/auth/admin/init'
    ];

    // Skip token if request matches a public route
    if (publicRoutes.some(route => config.url?.includes(route))) {
      return config;
    }

    // Add user token if available
    const userToken = localStorage.getItem('userToken');
    if (userToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    // Add admin token for admin routes
    if (config.url?.includes('/admin/') || config.url?.includes('/auth/admin/')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          if (data.message?.includes('admin')) {
            localStorage.removeItem('adminToken');
            if (window.location.pathname.includes('/admin/')) {
              window.location.href = '/admin/login';
            }
          } else {
            localStorage.removeItem('userToken');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;

        case 403:
          console.error('Access denied:', data.message);
          break;

        case 404:
          console.error('Resource not found:', error.config.url);
          break;

        case 429:
          console.error('Rate limit exceeded. Please try again later.');
          break;

        case 500:
          console.error('Server error. Please try again later.');
          break;

        default:
          console.error('API Error:', data.message || error.message);
      }

      return Promise.reject({
        message: data.message || 'An error occurred',
        status,
        data
      });
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please check your connection.',
        code: 'TIMEOUT'
      });
    }

    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      });
    }

    return Promise.reject(error);
  }
);

// Generic API methods for REST endpoints
const apiService = {
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      throw error;
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  patch: async (url, data = {}, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      throw error;
    }
  },

  upload: async (url, formData, onUploadProgress = null) => {
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }
      return await api.post(url, formData, config);
    } catch (error) {
      throw error;
    }
  },

  download: async (url, filename) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export { api };
export default apiService;