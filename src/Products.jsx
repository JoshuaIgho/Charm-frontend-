import React, { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useCart } from "./hooks/useCart";
import { useAuth } from "./hooks/useAuth";
import { CardSkeleton, InlineLoading } from "./components/common/Loading";
import ProductCard from "./components/customer/ProductCard";
import ProductFilters from "./components/customer/ProductFilters";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ProductList = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  // ✅ FIXED: Match schema fields exactly
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    isOnSale: searchParams.get("sale") === "true",
    isNewStock: searchParams.get("new") === "true",
  });

  // ✅ FIXED: Sync with URL
  useEffect(() => {
    const urlCategory = searchParams.get("category") || "";
    const urlMinPrice = searchParams.get("minPrice") || "";
    const urlMaxPrice = searchParams.get("maxPrice") || "";
    const urlIsOnSale = searchParams.get("sale") === "true";
    const urlIsNewStock = searchParams.get("new") === "true";
    const urlSearch = searchParams.get("search") || "";

    setFilters({
      category: urlCategory,
      minPrice: urlMinPrice,
      maxPrice: urlMaxPrice,
      isOnSale: urlIsOnSale,
      isNewStock: urlIsNewStock,
    });

    setSearchQuery(urlSearch);
    setCurrentPage(1);
  }, [searchParams]);

  const productsPerPage = 12;

  const getSortOption = useCallback((sortValue) => {
    const sortOptions = {
      newest: { id: "desc" },
      oldest: { id: "asc" },
      priceLow: { price: "asc" },
      priceHigh: { price: "desc" },
      nameAZ: { name: "asc" },
      nameZA: { name: "desc" },
    };
    return sortOptions[sortValue] || { id: "desc" };
  }, []);

  // ✅ FIXED: Build where clause with proper price range filtering
  const buildWhereClause = useCallback(() => {
    const where = {};
    const andConditions = [];

    // Search by name
    if (searchQuery) {
      where.name = { contains: searchQuery, mode: 'insensitive' };
    }

    // Filter by category (using categoryType field from schema)
    if (filters.category) {
      where.categoryType = { equals: filters.category };
    }

    // Filter by price range - ✅ CRITICAL FIX: Use AND for proper range
    if (filters.minPrice && filters.maxPrice) {
      // Both min and max: need AND to get products BETWEEN the range
      andConditions.push({ price: { gte: parseFloat(filters.minPrice) } });
      andConditions.push({ price: { lte: parseFloat(filters.maxPrice) } });
    } else if (filters.minPrice) {
      // Only minimum: products >= minPrice
      where.price = { gte: parseFloat(filters.minPrice) };
    } else if (filters.maxPrice) {
      // Only maximum: products <= maxPrice
      where.price = { lte: parseFloat(filters.maxPrice) };
    }

    // Filter by sale status
    if (filters.isOnSale) {
      where.isOnSale = { equals: true };
    }

    // Filter by new arrivals
    if (filters.isNewStock) {
      where.isNewStock = { equals: true };
    }

    // Apply AND conditions if we have any
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }, [searchQuery, filters]);

  const loadProducts = useCallback(async () => {
    console.log("Loading products from:", `${API_URL}/api/graphql`);
    setIsLoading(true);
    setError(null);

    try {
      const whereClause = buildWhereClause();
      console.log("GraphQL where clause:", JSON.stringify(whereClause, null, 2));

      const response = await fetch(`${API_URL}/api/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query Products($skip: Int, $take: Int, $orderBy: [ProductOrderByInput!], $where: ProductWhereInput) {
              products(skip: $skip, take: $take, orderBy: $orderBy, where: $where) {
                id
                name
                price
                originalPrice
                description
                stock
                image {
                  url
                }
                categoryType
                isOnSale
                isNewStock
                isFeatured
                averageRating
                totalReviews
              }
              productsCount(where: $where)
            }
          `,
          variables: {
            skip: (currentPage - 1) * productsPerPage,
            take: productsPerPage,
            orderBy: [getSortOption(sortBy)],
            where: whereClause,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GraphQL response:", result);

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(result.errors[0].message || "Failed to fetch products");
      }

      setProducts(result.data.products);
      setTotalProducts(result.data.productsCount);
    } catch (err) {
      console.error("Error loading products:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, sortBy, buildWhereClause, getSortOption]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      setCurrentPage(1);

      const newParams = new URLSearchParams(searchParams);
      if (searchQuery) {
        newParams.set("search", searchQuery);
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams);
    },
    [searchQuery, searchParams, setSearchParams]
  );

  // ✅ FIXED: Include all filter params in URL
  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      setCurrentPage(1);

      const newParams = new URLSearchParams();
      if (newFilters.category) newParams.set("category", newFilters.category);
      if (newFilters.minPrice) newParams.set("minPrice", newFilters.minPrice);
      if (newFilters.maxPrice) newParams.set("maxPrice", newFilters.maxPrice);
      if (newFilters.isOnSale) newParams.set("sale", "true");
      if (newFilters.isNewStock) newParams.set("new", "true");
      if (searchQuery) newParams.set("search", searchQuery);

      setSearchParams(newParams);
    },
    [searchQuery, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      isOnSale: false,
      isNewStock: false,
    });
    setSearchQuery("");
    setCurrentPage(1);
    setSearchParams({});
  }, [setSearchParams]);

  // ✅ FIXED: Don't reduce stock when adding to cart - only reduce on confirmed purchase
  const handleAddToCart = useCallback(
    async (product) => {
      try {
        if (!product || !product.id) {
          console.error("Invalid product data");
          return { success: false, message: "Invalid product data" };
        }

        console.log(`=== ADD TO CART START ===`);
        console.log(`Product: ${product.name}`);
        console.log(`Current stock: ${product.stock}`);

        const result = await addToCart(product);
        console.log(`Add to cart result:`, result);

        // ✅ Stock remains unchanged - will only be reduced when order is confirmed
        if (result && result.success) {
          console.log(`✅ Product added to cart successfully (stock unchanged)`);
        }

        console.log(`=== ADD TO CART END ===`);
        return result;
      } catch (error) {
        console.error("Error adding to cart:", error);
        return {
          success: false,
          message: error.message || "Failed to add to cart",
        };
      }
    },
    [addToCart]
  );

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter && filter !== ""
  );

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "priceLow", label: "Price: Low to High" },
    { value: "priceHigh", label: "Price: High to Low" },
    { value: "nameAZ", label: "Name: A to Z" },
    { value: "nameZA", label: "Name: Z to A" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : filters.category
                  ? `${
                      filters.category.charAt(0).toUpperCase() +
                      filters.category.slice(1)
                    }`
                  : "All Products"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {isLoading ? (
                  <InlineLoading message="Loading products..." size="sm" />
                ) : error ? (
                  <span className="text-red-600">Error loading products</span>
                ) : (
                  `${totalProducts} ${
                    totalProducts === 1 ? "product" : "products"
                  } found`
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
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </form>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                )}
              </button>

              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm text-gray-600">
                    Filters:
                  </span>
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs sm:text-sm">
                      {filters.category.charAt(0).toUpperCase() +
                        filters.category.slice(1)}
                      <button
                        onClick={() =>
                          handleFilterChange({ ...filters, category: "" })
                        }
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs sm:text-sm">
                      ₦{filters.minPrice || "0"} - ₦{filters.maxPrice || "∞"}
                      <button
                        onClick={() =>
                          handleFilterChange({
                            ...filters,
                            minPrice: "",
                            maxPrice: "",
                          })
                        }
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 sm:pr-10 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="hidden sm:flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-l-lg ${
                    viewMode === "grid"
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-r-lg ${
                    viewMode === "list"
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="hidden lg:block">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
              <div className="absolute right-0 top-0 h-full w-full sm:w-80 bg-white overflow-y-auto">
                <div className="p-4 sm:p-6">
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

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-4'}>
                <CardSkeleton count={productsPerPage} />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Error Loading Products</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <button
                    onClick={loadProducts}
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 text-sm sm:text-base"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </button>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-4'}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 sm:mt-12 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm ${
                          currentPage === i + 1
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductList.displayName = "ProductList";

export default ProductList;