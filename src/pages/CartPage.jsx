import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, User, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { useClerk, useAuth } from '@clerk/clerk-react';
import { useAuth as useCustomAuth } from '../hooks/useAuth';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const { isSignedIn, signIn } = useClerk();
  const { userId } = useAuth(); // Clerk's userId
  const { user: customUser } = useCustomAuth(); // Custom auth user
  const navigate = useNavigate();

  // Calculate cart totals
  const { subtotal, shipping, total } = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping over ₦50,000
    const total = subtotal + shipping;
    
    return { subtotal, shipping, total };
  }, [cartItems]);

  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;
    
    // Check stock limits
    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }
    
    // Set loading state for this item
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      // Clear loading state for this item
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  // ✅ UPDATED: Handle checkout with authentication check and redirect
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    // Check if user is signed in
    if (!isSignedIn || !userId) {
      toast.info("Please sign in to complete your purchase");
      // Redirect to sign-in page with return URL
      signIn({
        redirectUrl: '/cart'
      });
      return;
    }
    
    // Redirect to checkout page for signed-in users
    navigate('/checkout');
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-xl shadow-sm p-12">
          <div className="mb-6">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet
          </p>
          <Link 
            to="/products" 
            className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <Link to="/products" className="inline-flex items-center text-primary-600 hover:text-primary-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>
                <button 
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Cart
                </button>
              </div>
            </div>
            
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                    <img 
                      src={item.image?.url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80'} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.category?.name || 'Jewelry'}
                        </p>
                        <p className="text-lg font-medium text-primary-700 mt-2">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <span className="text-sm text-gray-500 mr-3">Quantity:</span>
                      <div className="flex items-center border rounded-lg">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItems[item.id]}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 text-center w-10">
                          {updatingItems[item.id] ? (
                            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock || updatingItems[item.id]}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="ml-auto font-medium">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Stock info */}
                    <div className="mt-2 text-xs text-gray-500">
                      {item.stock <= 5 && item.stock > 0 ? (
                        <span className="text-yellow-600">Only {item.stock} left in stock!</span>
                      ) : item.stock === 0 ? (
                        <span className="text-red-600">Out of stock</span>
                      ) : (
                        <span>In stock ({item.stock} available)</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}
                </span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-bold text-primary-700">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-primary-50 rounded-lg text-sm text-primary-800">
              {subtotal >= 50000 ? (
                <span>🎉 You qualify for FREE shipping!</span>
              ) : (
                <span>Add ₦{(50000 - subtotal).toLocaleString()} more to qualify for FREE shipping</span>
              )}
            </div>
            
            {/* ✅ UPDATED: Authentication-based checkout with clear messaging */}
            {isSignedIn && userId ? (
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Lock className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800">Sign In Required</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Please sign in to your account to complete your purchase.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In to Checkout
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      to="/sign-up" 
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Secure checkout powered by Paystack
              </p>
              <div className="flex justify-center mt-2 space-x-2">
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;