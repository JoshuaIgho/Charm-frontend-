import apiService from './api';

const productService = {
  // PUBLIC PRODUCT METHODS (accessible without authentication)

  // Get all products with filtering and pagination
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/products?${queryString}`);
  },

  // Get single product by ID
  getProduct: async (id) => {
    return await apiService.get(`/products/${id}`);
  },

  // Get product by slug
  getProductBySlug: async (slug) => {
    return await apiService.get(`/products/slug/${slug}`);
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    return await apiService.get(`/products/featured?limit=${limit}`);
  },

  // Get new arrivals
  getNewArrivals: async (limit = 8) => {
    return await apiService.get(`/products/new-arrivals?limit=${limit}`);
  },

  // Get products by category
  getProductsByCategory: async (category, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/products/category/${category}?${queryString}`);
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    const searchParams = { ...params, search: query };
    const queryString = new URLSearchParams(searchParams).toString();
    return await apiService.get(`/products/search?${queryString}`);
  },

  // Get product categories
  getCategories: async () => {
    return await apiService.get('/products/categories');
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 4) => {
    return await apiService.get(`/products/${productId}/related?limit=${limit}`);
  },

  // ADMIN PRODUCT METHODS (require admin authentication)

  // Create new product
  createProduct: async (productData) => {
    return await apiService.post('/products', productData);
  },

  // Update product
  updateProduct: async (id, productData) => {
    return await apiService.put(`/products/${id}`, productData);
  },

  // Delete product
  deleteProduct: async (id) => {
    return await apiService.delete(`/products/${id}`);
  },

  // Upload product images
  uploadProductImages: async (productId, formData, onUploadProgress) => {
    return await apiService.upload(
      `/products/${productId}/images`, 
      formData, 
      onUploadProgress
    );
  },

  // Delete product image
  deleteProductImage: async (productId, imageId) => {
    return await apiService.delete(`/products/${productId}/images/${imageId}`);
  },

  // Update stock
  updateStock: async (id, stockData) => {
    return await apiService.patch(`/products/${id}/stock`, stockData);
  },

  // Bulk update products
  bulkUpdateProducts: async (updates) => {
    return await apiService.patch('/products/bulk-update', { updates });
  },

  // Get admin products (includes inactive products)
  getAdminProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/admin/products?${queryString}`);
  },

  // Get low stock products
  getLowStockProducts: async () => {
    return await apiService.get('/admin/products/low-stock');
  },

  // Get product analytics
  getProductAnalytics: async (id, dateRange) => {
    const params = dateRange ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}` : '';
    return await apiService.get(`/admin/products/${id}/analytics${params}`);
  },

  // INVENTORY MANAGEMENT

  // Reserve stock (for cart items)
  reserveStock: async (productId, quantity) => {
    return await apiService.post(`/products/${productId}/reserve`, { quantity });
  },

  // Release reserved stock
  releaseStock: async (productId, quantity) => {
    return await apiService.post(`/products/${productId}/release`, { quantity });
  },

  // Check stock availability
  checkAvailability: async (items) => {
    return await apiService.post('/products/check-availability', { items });
  },

  // PRODUCT REVIEWS (if implementing reviews)

  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/products/${productId}/reviews?${queryString}`);
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    return await apiService.post(`/products/${productId}/reviews`, reviewData);
  },

  // Update review
  updateReview: async (productId, reviewId, reviewData) => {
    return await apiService.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
  },

  // Delete review
  deleteReview: async (productId, reviewId) => {
    return await apiService.delete(`/products/${productId}/reviews/${reviewId}`);
  },

  // UTILITY METHODS

  // Get product filters
  getFilters: async () => {
    return await apiService.get('/products/filters');
  },

  // Get product statistics for dashboard
  getProductStats: async (dateRange = null) => {
    const params = dateRange ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}` : '';
    return await apiService.get(`/admin/products/stats${params}`);
  },

  // Generate product report
  generateReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.download(`/admin/products/report?${queryString}`, 'products-report.xlsx');
  },

  // Import products from CSV/Excel
  importProducts: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiService.upload('/admin/products/import', formData, onUploadProgress);
  },

  // Export products to CSV/Excel
  exportProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.download(`/admin/products/export?${queryString}`, 'products.xlsx');
  }
};

export default productService;