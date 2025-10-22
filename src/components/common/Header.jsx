// src/components/common/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Truck, Phone, Mail, Menu, X, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {  ShoppingBag, MapPin } from "lucide-react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/clerk-react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import wishlistService from "../../services/wishlistService";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { userId } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Load wishlist count
  useEffect(() => {
    const loadWishlistCount = async () => {
      if (!userId) {
        setWishlistCount(0);
        return;
      }

      try {
        const response = await wishlistService.getUserWishlist(userId);
        if (response.success) {
          setWishlistCount(response.data.length);
        }
      } catch (error) {
        console.error('Error loading wishlist count:', error);
      }
    };

    loadWishlistCount();

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlistCount();
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [userId]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        isUserMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isUserMenuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    if (isUserMenuOpen || isMobileMenuOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isUserMenuOpen, isMobileMenuOpen]);

  const handleToggle = () => setIsUserMenuOpen((s) => !s);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/");
    }
  };

  const handleManageAccount = () => {
    setIsUserMenuOpen(false);
    openUserProfile();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="shadow-md bg-white sticky top-0 z-50">
      <div className="bg-gradient-to-r from-primary-600 via-primary-800 to-primary-900 text-white py-1 sm:py-1.5">
        <div className="container mx-auto px-2 sm:px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="flex items-center gap-1">
              <MapPin size={10} className="sm:w-3 sm:h-3 text-orange-200" />
              <span className="text-[10px] xs:text-[11px] sm:text-xs">Lagos, Nigeria</span>
            </span>
            <span className="hidden xs:flex items-center gap-1 border border-orange-400 px-1.5 sm:px-3 py-0.5 rounded-full">
              <Truck size={10} className="sm:w-3 sm:h-3 text-orange-200" />
              <span className="text-[9px] xs:text-[10px] sm:text-xs">Free shipping on ₦50,000+</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-orange-200" />
              <span className="text-xs">+234-123-456-7890</span>
            </span>
            <span className="flex items-center gap-1">
              <Mail size={12} className="text-orange-200" />
              <span className="text-xs">info@Charmé-jewelry.com</span>
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xs xs:text-sm sm:text-base">
            CBS
          </div>
          <div className="xs:block">
            <div className="text-lg xs:text-xl sm:text-2xl font-black">CHARMÉ</div>
            <div className="text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wide text-gray-500">For the C-Girlies</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          <Link to="/" className="text-sm font-semibold hover:text-primary-600 transition-colors">Home</Link>
          <Link to="/products" className="text-sm font-semibold hover:text-primary-600 transition-colors">Products</Link>
          <Link to="/products?category=rings" className="text-sm font-semibold hover:text-primary-600 transition-colors">Rings</Link>
          <Link to="/products?category=necklaces" className="text-sm font-semibold hover:text-primary-600 transition-colors">Necklaces</Link>
          <Link to="/products?category=earrings" className="text-sm font-semibold hover:text-primary-600 transition-colors">Earrings</Link>
          <Link to="/products?category=bracelets" className="text-sm font-semibold hover:text-primary-600 transition-colors">Bracelets</Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
        

          {/* Wishlist Link with counter */}
          <SignedIn>
            <Link to="/dashboard?tab=wishlist" className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 relative transition-colors">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] xs:text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
          </SignedIn>
          
          {/* Cart Link with count badge */}
          <Link to="/cart" className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 relative transition-colors">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] xs:text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>

          <SignedOut>
            <Link to="/sign-in" className="hidden sm:inline-block px-2 xs:px-3 sm:px-4 py-1.5 rounded-lg border hover:bg-gray-50 text-xs transition-colors">
              Sign In
            </Link>
            <Link to="/sign-up" className="hidden sm:inline-block px-2 xs:px-3 sm:px-4 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700 transition-colors">
              Sign Up
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="relative hidden sm:block">
              <button
                ref={buttonRef}
                onClick={handleToggle}
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-9 rounded-lg bg-primary-100 flex items-center justify-center border border-primary-200 text-primary-700 font-bold text-xs sm:text-sm">
                  {user?.firstName?.charAt(0) ?? "U"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[80px]">{user?.firstName ?? "User"}</div>
                  <div className="text-[9px] sm:text-xs text-gray-500">My Account</div>
                </div>
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div
                  ref={menuRef}
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg overflow-hidden z-50"
                >
                  <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-200 flex items-center justify-center font-semibold text-primary-700">
                        {user?.firstName?.charAt(0) ?? "U"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</div>
                        <div className="text-xs text-gray-600 truncate">{user?.emailAddresses[0]?.emailAddress}</div>
                      </div>
                    </div>
                  </div>

                  <nav className="py-2">
                    <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                      <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleManageAccount}
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Manage Account
                    </button>
                    <div className="border-t my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </SignedIn>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-gray-50 border-t border-gray-200 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-3 sm:px-4 pt-2 pb-4 space-y-1">
          <Link to="/" onClick={closeMobileMenu} className="block px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors">
            Home
          </Link>
          <Link to="/products" onClick={closeMobileMenu} className="block px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors">
            Products
          </Link>
          <Link to="/products?category=rings" onClick={closeMobileMenu} className="block px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors">
            Rings
          </Link>
          <Link to="/products?category=necklaces" onClick={closeMobileMenu} className="block px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors">
            Necklaces
          </Link>
          <Link to="/products?category=earrings" onClick={closeMobileMenu} className="block px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors">
            Earrings
          </Link>
          <Link to="/products?category=bracelets" onClick={closeMobileMenu} className="block px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors">
            Bracelets
          </Link>

          <div className="pt-3 border-t border-gray-200 mt-3">
            <SignedOut>
              <Link to="/sign-in" onClick={closeMobileMenu} className="block px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-primary-600 rounded-lg transition-colors mb-2">
                Sign In
              </Link>
              <Link to="/sign-up" onClick={closeMobileMenu} className="block w-full text-center px-3 sm:px-4 py-2 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Sign Up
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="px-3 sm:px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-200 flex items-center justify-center font-semibold text-primary-700">
                    {user?.firstName?.charAt(0) ?? "U"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-gray-600 truncate">{user?.emailAddresses[0]?.emailAddress}</div>
                  </div>
                </div>
              </div>

              <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-colors">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
             
              <button 
                onClick={handleManageAccount}
                className="flex items-center w-full px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition-colors"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Account
              </button>
              <div className="border-t border-gray-200 my-2" />
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 sm:px-4 py-2 text-sm font-medium text-red-600 hover:bg-white rounded-lg transition-colors"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
}