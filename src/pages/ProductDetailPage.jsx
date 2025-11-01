import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  ArrowLeft,
  Star,
  Truck,
  Shield,
  Package
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import wishlistService from '../services/wishlistService';
import { toast } from 'react-toastify';
import { InlineLoading } from '../components/common/Loading';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/graphql';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, userId } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Wishlist state
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching product from:', API_URL);
        
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetProduct($id: ID!) {
                product(where: { id: $id }) {
                  id
                  name
                  description
                  price
                  originalPrice
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
              }
            `,
            variables: { id }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Product data received:', result);

        if (result.errors) {
          console.error('❌ GraphQL errors:', result.errors);
          throw new Error(result.errors[0]?.message || 'Failed to load product');
        }

        if (!result.data?.product) {
          throw new Error('Product not found');
        }

        setProduct(result.data.product);
        console.log('📦 Product loaded:', result.data.product);
        
      } catch (err) {
        console.error('❌ Error loading product:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);
  
  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!userId || !product?.id) return;

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
        console.error('Error checking wishlist:', error);
      }
    };

    checkWishlistStatus();
  }, [userId, product?.id]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !userId) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    setIsWishlistLoading(true);

    try {
      if (isInWishlist && wishlistItemId) {
        const response = await wishlistService.removeFromWishlist(wishlistItemId);
        if (response.success) {
          setIsInWishlist(false);
          setWishlistItemId(null);
          toast.success('Removed from wishlist!');
          window.dispatchEvent(new CustomEvent('wishlist-updated'));
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await wishlistService.addToWishlist(userId, product.id);
        if (response.success) {
          setIsInWishlist(true);
          setWishlistItemId(response.data.id);
          toast.success('Added to wishlist!');
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
  };

  // ✅ FIXED: Stock remains unchanged when adding to cart
  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);

    try {
      const result = await addToCart({ ...product, quantity });
      
      if (result?.success) {
        toast.success(`Added ${quantity} item(s) to cart!`);
        // ✅ Stock is NOT reduced here - only on confirmed purchase
        setQuantity(1);
      } else {
        toast.error(result?.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    })
      .format(price)
      .replace('NGN', '₦');
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <InlineLoading size="lg" message="Loading product..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error === 'Failed to fetch' ? 'Cannot connect to server' : ''}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 10;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          {product.categoryType && (
            <>
              <span>/</span>
              <Link 
                to={`/products?category=${product.categoryType}`}
                className="hover:text-primary-600 capitalize"
              >
                {product.categoryType}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
              <div className="aspect-square">
                <img
                  src={product.image?.url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex gap-2">
              {product.isOnSale && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                  SALE
                </span>
              )}
              {product.isNewStock && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                  NEW
                </span>
              )}
              {product.isFeatured && (
                <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full">
                  FEATURED
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-8">
              {product.categoryType && (
                <p className="text-sm text-primary-600 font-medium mb-2 uppercase tracking-wide">
                  {product.categoryType}
                </p>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              {product.totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.averageRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-2xl text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                  <div className="text-4xl font-bold text-primary-600">
                    {formatPrice(product.price)}
                  </div>
                </div>
                
                {/* Stock Badge */}
                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                    Only {product.stock} left!
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    In Stock ({product.stock} available)
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-6 py-2 font-semibold text-gray-900 min-w-[60px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock}
                        className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.stock} available
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                  className="flex-1 bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </button>

                {isAuthenticated && (
                  <button
                    onClick={handleWishlistToggle}
                    disabled={isWishlistLoading}
                    className={`px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                      isInWishlist
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="h-5 w-5 text-primary-600" />
                  <span className="text-sm">Free shipping on orders over ₦50,000</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="h-5 w-5 text-primary-600" />
                  <span className="text-sm">Secure payment & buyer protection</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Package className="h-5 w-5 text-primary-600" />
                  <span className="text-sm">Easy returns within 14 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;