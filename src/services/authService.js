import apiService from './api';

const authService = {
  // USER AUTHENTICATION

  // Register new user (force no token)
  register: async (userData) => {
    return await apiService.post('/auth/register', userData, {
      headers: { Authorization: "" }
    });
  },

  // Login user (force no token)
  login: async (email, password) => {
    return await apiService.post('/auth/login', { email, password }, {
      headers: { Authorization: "" }
    });
  },

  // Get user profile
  getProfile: async (token) => {
    return await apiService.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Update user profile
  updateProfile: async (profileData, token) => {
    return await apiService.put('/auth/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Change password
  changePassword: async (passwordData, token) => {
    return await apiService.put('/auth/change-password', passwordData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Forgot password (force no token)
  forgotPassword: async (email) => {
    return await apiService.post('/auth/forgot-password', { email }, {
      headers: { Authorization: "" }
    });
  },

  // Reset password (force no token)
  resetPassword: async (token, password) => {
    return await apiService.put(`/auth/reset-password/${token}`, { password }, {
      headers: { Authorization: "" }
    });
  },

  // ADMIN AUTHENTICATION

  // Login admin (force no token)
  adminLogin: async (email, password) => {
    return await apiService.post('/auth/admin/login', { email, password }, {
      headers: { Authorization: "" }
    });
  },

  // Get admin profile
  getAdminProfile: async (token) => {
    return await apiService.get('/auth/admin/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Update admin profile
  updateAdminProfile: async (profileData, token) => {
    return await apiService.put('/auth/admin/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Change admin password
  changeAdminPassword: async (passwordData, token) => {
    return await apiService.put('/auth/admin/change-password', passwordData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Initialize super admin (force no token)
  initializeSuperAdmin: async () => {
    return await apiService.post('/auth/admin/init', {}, {
      headers: { Authorization: "" }
    });
  },

  // Validate token (generic method)
  validateToken: async (token, isAdmin = false) => {
    const endpoint = isAdmin ? '/auth/admin/me' : '/auth/me';
    return await apiService.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Logout (client-side only - just removes tokens)
  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
  }
};

export default authService;
