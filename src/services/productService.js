// productService.js - CLEAN WORKING VERSION

// ✅ Import API_URL from your config
import { API_URL } from './api';

// ✅ Properly extract the base URL
const getBaseUrl = (url) => {
  if (url.endsWith('/api/graphql')) {
    return url.replace('/api/graphql', '');
  }
  if (url.endsWith('/graphql')) {
    return url.replace('/graphql', '');
  }
  return url;
};

const BASE_URL = getBaseUrl(API_URL);

console.log('🔧 Configured URLs:', {
  'Original API_URL': API_URL,
  'BASE_URL for REST': BASE_URL,
});

const productService = {
  // ========================================
  // WORKING METHODS (Routes exist in keystone.ts)
  // ========================================

  // ✅ Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      const url = `${BASE_URL}/api/products/featured?limit=${limit}`;
      console.log(`🔍 Calling: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('❌ Expected JSON but got:', contentType);
        const text = await response.text();
        console.error('Response preview:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch featured products`);
      }
      
      const data = await response.json();
      console.log('✅ Featured products response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Featured products error:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ Get new arrivals
  getNewArrivals: async (limit = 8) => {
    try {
      const url = `${BASE_URL}/api/products/new-arrivals?limit=${limit}`;
      console.log(`🆕 Calling: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('❌ Expected JSON but got:', contentType);
        const text = await response.text();
        console.error('Response preview:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch new arrivals`);
      }
      
      const data = await response.json();
      console.log('✅ New arrivals response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ New arrivals error:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ Get all products (exists in keystone.ts)
  getProducts: async (limit = 20, category = null, isNew = false) => {
    try {
      let url = `${BASE_URL}/api/products?limit=${limit}`;
      if (category) url += `&category=${category}`;
      if (isNew) url += `&new=true`;
      
      console.log(`📦 Calling: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch products`);
      }
      
      const data = await response.json();
      console.log('✅ Products response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Products error:', error);
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // PLACEHOLDER METHODS (Need backend routes)
  // ========================================
  
  // These will be implemented when you create the backend routes
  
  getProduct: async (id) => {
    console.warn('⚠️ getProduct not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  getProductBySlug: async (slug) => {
    console.warn('⚠️ getProductBySlug not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  getProductsByCategory: async (category, params = {}) => {
    console.warn('⚠️ getProductsByCategory not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  searchProducts: async (query, params = {}) => {
    console.warn('⚠️ searchProducts not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  getCategories: async () => {
    console.warn('⚠️ getCategories not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  getRelatedProducts: async (productId, limit = 4) => {
    console.warn('⚠️ getRelatedProducts not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  createProduct: async (productData) => {
    console.warn('⚠️ createProduct not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  updateProduct: async (id, productData) => {
    console.warn('⚠️ updateProduct not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  deleteProduct: async (id) => {
    console.warn('⚠️ deleteProduct not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  uploadProductImages: async (productId, formData, onUploadProgress) => {
    console.warn('⚠️ uploadProductImages not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  deleteProductImage: async (productId, imageId) => {
    console.warn('⚠️ deleteProductImage not implemented yet');
    return { success: false, error: 'Not implemented' };
  },

  updateStock: async (id, stockData) => {
    console.warn('⚠️ updateStock not implemented yet');
    return { success: false, error: 'Not implemented' };
  },
};

export default productService;