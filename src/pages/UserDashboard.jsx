import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Package, Heart, MapPin, Settings, LogOut, ShoppingBag,
  Clock, Truck, CheckCircle, XCircle, Eye, Plus, Edit, Trash2, X, Save, Menu
} from 'lucide-react';
import { useUser, useClerk } from "@clerk/clerk-react";
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import orderService from '../services/orderService';
import wishlistService from '../services/wishlistService';
import addressService from '../services/addressService';
import { InlineLoading } from '../components/common/Loading';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { userId } = useAuth();
  
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    isDefault: false
  });

  // Settings state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Close mobile menu when tab changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [activeTab]);

  // Initialize profile form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        phone: user.phoneNumbers?.[0]?.phoneNumber || ''
      });
    }
  }, [user]);

  // Load wishlist from Keystone
  useEffect(() => {
    const loadWishlist = async () => {
      if (!userId || activeTab !== 'wishlist') return;
      
      setWishlistLoading(true);
      const response = await wishlistService.getUserWishlist(userId);
      if (response.success) {
        setWishlistItems(response.data);
      }
      setWishlistLoading(false);
    };

    loadWishlist();
  }, [userId, activeTab]);

  // Load addresses from Keystone
  useEffect(() => {
    const loadAddresses = async () => {
      if (!userId || activeTab !== 'addresses') return;
      
      setAddressesLoading(true);
      const response = await addressService.getUserAddresses(userId);
      if (response.success) {
        setAddresses(response.data);
      }
      setAddressesLoading(false);
    };

    loadAddresses();
  }, [userId, activeTab]);

  const removeFromWishlist = async (wishlistItemId) => {
    const response = await wishlistService.removeFromWishlist(wishlistItemId);
    if (response.success) {
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
      toast.success(response.message);
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    } else {
      toast.error(response.message);
    }
  };

  // Address functions
  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        fullName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
        isDefault: addresses.length === 0
      });
    }
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    let response;
    if (editingAddress) {
      response = await addressService.updateAddress(editingAddress.id, addressForm);
    } else {
      response = await addressService.createAddress(userId, addressForm);
    }

    if (response.success) {
      const loadResponse = await addressService.getUserAddresses(userId);
      if (loadResponse.success) {
        setAddresses(loadResponse.data);
      }
      toast.success(response.message);
      closeAddressModal();
    } else {
      toast.error(response.message);
    }
  };

  const deleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const response = await addressService.deleteAddress(addressId);
      if (response.success) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    }
  };

  const setDefaultAddress = async (addressId) => {
    const response = await addressService.setDefaultAddress(userId, addressId);
    if (response.success) {
      const loadResponse = await addressService.getUserAddresses(userId);
      if (loadResponse.success) {
        setAddresses(loadResponse.data);
      }
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const ordersResponse = await orderService.getUserOrders({ userId });

        if (ordersResponse.success) {
          const orders = ordersResponse.data.orders || [];
          setRecentOrders(orders.slice(0, 5));

          setOrderStats({
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
            completedOrders: orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
            totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          });
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user && userId) {
      loadDashboardData();
    }
  }, [isLoaded, user, userId]);

  // Load all orders when orders tab is active
  useEffect(() => {
    const loadAllOrders = async () => {
      if (activeTab !== 'orders' || !userId) return;
      
      try {
        setOrdersLoading(true);
        const ordersResponse = await orderService.getUserOrders({ userId });

        if (ordersResponse.success) {
          setAllOrders(ordersResponse.data.orders || []);
        }
      } catch (err) {
        console.error("Error loading all orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadAllOrders();
  }, [activeTab, userId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
      case 'processing': return <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
      default: return <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <InlineLoading size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Please sign in to view your dashboard</h2>
        <Link to="/sign-in" className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">
          Sign In
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container-custom px-4">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-xs text-gray-600 truncate max-w-[150px]">{user?.emailAddresses?.[0]?.emailAddress}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
              <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Menu</h3>
                    <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                            activeTab === tab.id 
                              ? 'bg-primary-50 text-primary-700 font-medium' 
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {tab.label}
                        </button>
                      );
                    })}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-sm text-gray-600">{user?.emailAddresses?.[0]?.emailAddress}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                        activeTab === tab.id 
                          ? 'bg-primary-50 text-primary-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-8">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
                      <p className="text-sm sm:text-base text-primary-100">Here's what's happening with your account today.</p>
                    </div>
                    <div className="hidden sm:block">
                      <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-primary-200" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {isLoading ? <InlineLoading size="sm" /> : orderStats.totalOrders || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Total Orders</div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {isLoading ? <InlineLoading size="sm" /> : orderStats.pendingOrders || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Pending</div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {isLoading ? <InlineLoading size="sm" /> : orderStats.completedOrders || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{cartCount}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Items in Cart</div>
                  </div>
                </div>

                {cartCount > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Current Cart</h3>
                      <Link to="/cart" className="text-sm text-primary-600 hover:text-primary-500 font-medium">View Cart</Link>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="text-base sm:text-lg font-semibold text-gray-900">{cartCount} {cartCount === 1 ? 'Item' : 'Items'}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Ready for checkout</div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xl sm:text-2xl font-bold text-primary-600">₦{cartTotal.toLocaleString()}</div>
                          <Link to="/checkout" className="inline-block px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 mt-2">
                            Checkout
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                      View All
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentOrders.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3 flex-1">
                              <div className="flex items-center gap-2 min-w-0">
                                {getStatusIcon(order.status)}
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 text-sm sm:text-base truncate">Order #{order.orderNumber}</div>
                                  <div className="text-xs sm:text-sm text-gray-600">{formatDate(order.createdAt)}</div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">₦{order.totalAmount.toLocaleString()}</div>
                              <div className="text-xs sm:text-sm text-gray-600">{order.items?.length || 0} items</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                      <p className="text-sm text-gray-600 mb-4">Start shopping to see your orders here</p>
                      <Link to="/products" className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                        Browse Products
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 sm:h-24 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : allOrders.length > 0 ? (
                  <>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-4">
                      {allOrders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-1">#{order.orderNumber}</div>
                              <div className="text-xs text-gray-600">{formatDate(order.createdAt)}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-base font-semibold text-gray-900">₦{order.totalAmount.toLocaleString()}</div>
                            <Link to={`/order-confirmation/${order.id}`} className="text-primary-600 hover:text-primary-900 flex items-center text-sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₦{order.totalAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/order-confirmation/${order.id}`} className="text-primary-600 hover:text-primary-900 flex items-center justify-end">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders found</h4>
                    <p className="text-sm text-gray-600 mb-4">You haven't placed any orders yet</p>
                    <Link to="/products" className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">My Wishlist</h3>
                  <Link to="/products" className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">Browse Products</span>
                    <span className="xs:hidden">Browse</span>
                  </Link>
                </div>
                
                {wishlistLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-28 sm:h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-3 sm:gap-4">
                          <img 
                            src={item.product?.image?.url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&q=80'} 
                            alt={item.product?.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base line-clamp-2">{item.product?.name}</h4>
                            <p className="text-base sm:text-lg font-bold text-primary-600 mb-2">₦{item.product?.price.toLocaleString()}</p>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              <Link to={`/products/${item.product?.id}`} className="text-xs sm:text-sm text-primary-600 hover:text-primary-700">
                                View Details
                              </Link>
                              <button 
                                onClick={() => removeFromWishlist(item.id)}
                                className="text-xs sm:text-sm text-red-600 hover:text-red-700 flex items-center"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h4>
                    <p className="text-sm text-gray-600 mb-4 sm:mb-6">Save items you like to your wishlist</p>
                    <Link to="/products" className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Saved Addresses</h3>
                  <button 
                    onClick={() => openAddressModal()}
                    className="text-sm text-primary-600 hover:text-primary-500 font-medium flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">Add New</span>
                    <span className="xs:hidden">Add</span>
                  </button>
                </div>
                
                {addressesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[1, 2].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-36 sm:h-40 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className={`border-2 rounded-lg p-3 sm:p-4 ${address.isDefault ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                        {address.isDefault && (
                          <span className="inline-block px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded mb-2">
                            Default
                          </span>
                        )}
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{address.fullName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">{address.phone}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-2">{address.address}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          <button 
                            onClick={() => openAddressModal(address)}
                            className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                          {!address.isDefault && (
                            <button 
                              onClick={() => setDefaultAddress(address.id)}
                              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                            >
                              Set Default
                            </button>
                          )}
                          <button 
                            onClick={() => deleteAddress(address.id)}
                            className="text-xs sm:text-sm text-red-600 hover:text-red-700 flex items-center"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No saved addresses</h4>
                    <p className="text-sm text-gray-600 mb-4 sm:mb-6">Save your addresses for faster checkout</p>
                    <button 
                      onClick={() => openAddressModal()}
                      className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Account Settings</h3>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">Profile Information</h4>
                      <button 
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
                      >
                        {isEditingProfile ? (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </>
                        )}
                      </button>
                    </div>
                    
                    {isEditingProfile ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        toast.info('Profile updates are managed through Clerk. Please use the User Button menu to update your profile.');
                        setIsEditingProfile(false);
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                              type="text"
                              value={profileForm.firstName}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                              type="text"
                              value={profileForm.lastName}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={profileForm.email}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                          Profile information is managed by Clerk. Click on your profile icon in the header to update your details.
                        </p>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">First Name</p>
                          <p className="font-medium text-sm sm:text-base">{user?.firstName || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Last Name</p>
                          <p className="font-medium text-sm sm:text-base">{user?.lastName || 'Not set'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs sm:text-sm text-gray-600">Email</p>
                          <p className="font-medium text-sm sm:text-base break-all">{user?.emailAddresses?.[0]?.emailAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Password & Security</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Your password is managed by Clerk authentication.</p>
                    <p className="text-xs sm:text-sm text-blue-600">Click on your profile icon in the header to manage your password and security settings.</p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Connected Accounts</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs sm:text-sm font-bold text-white">C</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Clerk Authentication</p>
                          <p className="text-xs sm:text-sm text-green-600">Connected & Active</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Account Statistics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-primary-600">{orderStats.totalOrders || 0}</div>
                        <div className="text-xs text-gray-600">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-primary-600">{wishlistItems.length}</div>
                        <div className="text-xs text-gray-600">Wishlist</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-primary-600">{addresses.length}</div>
                        <div className="text-xs text-gray-600">Addresses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-primary-600">₦{(orderStats.totalSpent || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Total Spent</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={closeAddressModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-xs sm:text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAddressModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingAddress ? 'Update' : 'Save'} Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;