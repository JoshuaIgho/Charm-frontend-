import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ChevronDown, 
  X, 
  Star,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import productService from '../services/productService';
import { CardSkeleton, InlineLoading } from '../components/common/Loading';
import ProductCard from '../components/customer/ProductCard';
import ProductFilters from '../components/customer/ProductFilters';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    material: searchParams.get('material') || '',
    onSale: searchParams.get('sale') === 'true',
    newArrivals: searchParams.get('new') === 'true'
  });

  const productsPerPage = 12;

  // Load products based on current filters and search
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params = {
        page: currentPage,
        limit: productsPerPage,
        sort: getSortOption(sortBy),
        ...filters
      };

      // Add search query if present
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === false) {
          delete params[key];
        }
      });

      const response = await productService.getProducts(params);
      
      if (response.success) {
        setProducts(response.data.products || []);
        setTotalProducts(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, filters, searchQuery]);

  // Update URL params when filters change
  const updateURLParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.material) params.set('material', filters.material);
    if (filters.onSale) params.set('sale', 'true');
    if (filters.newArrivals) params.set('new', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (sortBy !== 'newest') params.set('sort', sortBy);

    setSearchParams(params);
  }, [searchQuery, filters, currentPage, sortBy, setSearchParams]);

  // Load products when dependencies change
  useEffect(() => {
    loadProducts();
    updateURLParams();
  }, [loadProducts, updateURLParams]);

  // Initialize from URL params
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page')) || 1;
    const urlSort = searchParams.get('sort') || 'newest';
    
    setCurrentPage(urlPage);
    setSortBy(urlSort);
  }, [searchParams]);

  const getSortOption = (sortValue) => {
    const sortOptions = {
      newest: '-createdAt',
      oldest: 'createdAt',
      priceLow: 'price',
      priceHigh: '-price',
      nameAZ: 'name',
      nameZA: '-name',
      popular: '-views'
    };
    return sortOptions[sortValue] || '-createdAt';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      material: '',
      onSale: false,
      newArrivals: false
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product, 1);
    return result.success;
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const hasActiveFilters = Object.values(filters).some(filter => filter && filter !== '');

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'nameAZ', label: 'Name: A to Z' },
    { value: 'nameZA', label: 'Name: Z to A' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Search results for "${searchQuery}"` : 
                 filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}` : 
                 'All Products'}
              </h1>
              <p className="text-gray-600">
                {isLoading ? (
                  <InlineLoading message="Loading products..." size="sm" />
                ) : (
                  `${totalProducts} ${totalProducts === 1 ? 'product' : 'products'} found`
                )}
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full lg:w-96">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </form>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                )}
              </button>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Filters:</span>
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                      {filters.category}
                      <button
                        onClick={() => handleFilterChange({ ...filters, category: '' })}
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.material && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                      {filters.material}
                      <button
                        onClick={() => handleFilterChange({ ...filters, material: '' })}
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                      ₦{filters.minPrice || '0'} - ₦{filters.maxPrice || '∞'}
                      <button
                        onClick={() => handleFilterChange({ ...filters, minPrice: '', maxPrice: '' })}
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg ${
                    viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg ${
                    viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
              <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={handleFilterChange}
                    onClearFilters={clearFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-4'}>
                <CardSkeleton count={productsPerPage} />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-4'}>
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      const isVisible = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 2 && page <= currentPage + 2);
                      
                      if (!isVisible) {
                        if (page === 2 || page === totalPages - 1) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === page
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || hasActiveFilters
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'We\'re still building our collection. Check back soon!'}
                </p>
                {(searchQuery || hasActiveFilters) && (
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Clear filters and show all products
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;