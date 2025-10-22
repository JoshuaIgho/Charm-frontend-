import React, { useState, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import wishlistService from '../../services/wishlistService';
import { toast } from 'react-toastify';

const ProductCard = memo(({ 
  product, 
  viewMode = 'grid', 
  onAddToCart,
  showQuickView = true 
}) => {
  const { isAuthenticated, userId } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Check if product is in wishlist on mount
  React.useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!userId || !product.id) return;

      try {
        const response = await wishlistService.getUserWishlist(userId);
        if (response.success) {
          const wishlistItem = response.data.find(
            item => item.product?.id === product.id
          );
          if (wishlistItem) {
            setIsInWishlist(true);
            setWishlistItemId(wishlistItem.id);
          }
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [userId, product.id]);

  const stockValue = useMemo(() => {
    let stock = product.stock;
    if (typeof stock === 'string') stock = parseInt(stock, 10);
    return isNaN(stock) ? null : stock;
  }, [product.stock]);

  const productAvailable = useMemo(() => {
    if (stockValue !== null) return stockValue > 0;
    if (typeof product.isAvailable === 'boolean') return product.isAvailable;
    return true;
  }, [stockValue, product.isAvailable]);

  const lowStock = useMemo(() => {
    return typeof stockValue === 'number' && stockValue > 0 && stockValue < 10;
  }, [stockValue]);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productAvailable) {
      setCartError("Product is out of stock");
      return;
    }

    setIsAddingToCart(true);
    setCartError(null);

    try {
      if (!onAddToCart) throw new Error("Add to cart function not available");
      const result = await onAddToCart(product);

      if (!result?.success) {
        setCartError(result?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setCartError(err.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  }, [product, onAddToCart, productAvailable]);

  const handleWishlistToggle = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !userId) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    setIsWishlistLoading(true);

    try {
      if (isInWishlist && wishlistItemId) {
        // Remove from wishlist
        const response = await wishlistService.removeFromWishlist(wishlistItemId);
        
        if (response.success) {
          setIsInWishlist(false);
          setWishlistItemId(null);
          toast.success('Removed from wishlist!');
          
          // Dispatch event to update header count
          window.dispatchEvent(new CustomEvent('wishlist-updated'));
        } else {
          toast.error(response.message);
        }
      } else {
        // Add to wishlist
        const response = await wishlistService.addToWishlist(userId, product.id);
        
        if (response.success) {
          setIsInWishlist(true);
          setWishlistItemId(response.data.id);
          toast.success('Added to wishlist!');
          
          // Dispatch event to update header count
          window.dispatchEvent(new CustomEvent('wishlist-updated'));
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  }, [isAuthenticated, userId, product.id, isInWishlist, wishlistItemId]);

  const getImageUrl = useCallback(() => {
    if (imageError) {
      return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80';
    }
    return (
      product.image?.url ||
      product.primaryImage?.url ||
      product.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80'
    );
  }, [imageError, product.image?.url, product.primaryImage?.url, product.images]);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    })
      .format(price)
      .replace('NGN', '₦');
  }, []);

  const discountPercentage = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }, [product.originalPrice, product.price]);

  const categoryName = useMemo(() => {
    if (!product.category) return null;
    if (typeof product.category === 'object' && product.category.name) return product.category.name;
    if (typeof product.category === 'string') return product.category;
    return null;
  }, [product.category]);

  const StockInfo = productAvailable && stockValue && (
    <p className="text-sm text-gray-600">
      {stockValue} {stockValue === 1 ? 'item' : 'items'} available
    </p>
  );

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Link to={`/products/${product.id}`}>
              <img
                src={getImageUrl()}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNewStock && <Badge color="green">New</Badge>}
                {discountPercentage > 0 && <Badge color="red">-{discountPercentage}%</Badge>}
                {lowStock && <Badge color="yellow">Low Stock</Badge>}
              </div>
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 pr-4">
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                {categoryName && <p className="text-sm text-gray-500 capitalize mt-1">{categoryName}</p>}
                {StockInfo}
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                  className={`p-2 transition-colors ${
                    isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                  title="Add to wishlist"
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {discountPercentage > 0 && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!productAvailable || isAddingToCart}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {cartError && <p className="text-red-500 text-sm mt-2">{cartError}</p>}
            {!productAvailable && <p className="text-red-600 text-sm font-medium mt-2">Out of Stock</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        </Link>

        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 product-card-badges">
          {product.isNewStock && <Badge color="green">New</Badge>}
          {discountPercentage > 0 && <Badge color="red">-{discountPercentage}%</Badge>}
          {lowStock && <Badge color="yellow">Low Stock</Badge>}
        </div>

        {isAuthenticated && (
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 product-card-wishlist ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`h-3 w-3 md:h-4 md:w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="p-3 md:p-4 product-card-content">
        {categoryName && <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 product-card-category">{categoryName}</p>}
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm md:text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2 product-card-title">
            {product.name}
          </h3>
        </Link>
        {StockInfo}

        <div className="flex items-center justify-between mt-2 mb-3 md:mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            {discountPercentage > 0 && (
              <span className="text-xs md:text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-base md:text-lg font-bold text-primary-600 product-card-price">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!productAvailable || isAddingToCart}
          className="w-full py-2 px-3 md:px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-xs md:text-sm product-card-button"
        >
          {isAddingToCart ? (
            <>
              <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Adding...</span>
            </>
          ) : !productAvailable ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Add to Cart</span>
              <span className="xs:hidden">Add</span>
            </>
          )}
        </button>

        {cartError && <p className="text-red-500 text-xs md:text-sm mt-2">{cartError}</p>}
      </div>
    </div>
  );
});

const Badge = ({ color, children }) => {
  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };
  
  return (
    <span className={`${colorClasses[color]} text-white text-xs px-2 py-1 rounded-full font-medium`}>
      {children}
    </span>
  );
};

ProductCard.displayName = 'ProductCard';
export default ProductCard;