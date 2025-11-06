import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, Plus, Edit, Trash2, X, Eye, MapPin, Phone, Mail, User, CheckCircle, XCircle, ZoomIn, Upload, Menu, ExternalLink, LogOut } from 'lucide-react';

// Get API URLs from environment variables
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api/graphql';
const REST_API_URL = import.meta.env.VITE_REST_API_URL || 'http://localhost:4000';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [notification, setNotification] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-700' },
    { value: 'outforshipping', label: 'Out for Shipping', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'shipped', label: 'Shipped', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleMainWebsite = () => {
    window.open('/', '_blank');
  };

const handleSignOut = () => {
  // Clear all stored session data
  localStorage.removeItem('adminToken');
  sessionStorage.clear();

  // Disable browser back navigation
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = () => {
    window.history.go(1);
  };

  // Notify user
  showNotification('Signing out...', 'success');

  // Redirect to login after a delay
  setTimeout(() => {
    window.location.href = '/admin';
  }, 1000);
};



  const handleRangeChange = (range) => {
    setSelectedRange(range);
    updateSalesData(range);
  };

  const updateSalesData = (range) => {
    if (!orders.length) return;
    const now = new Date();
    let data = [];

    if (range === '7d') {
      data = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(now.getDate() - (6 - i));
        const day = date.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => o.createdAt?.startsWith(day));
        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          orders: dayOrders.length
        };
      });
    } else if (range === '4w') {
      data = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7 * (3 - i));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= weekStart && date <= weekEnd;
        });
        return {
          name: `Week ${i + 1}`,
          sales: weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          orders: weekOrders.length
        };
      });
    } else if (range === '6m') {
      data = Array.from({ length: 6 }, (_, i) => {
        const monthDate = new Date(now);
        monthDate.setMonth(now.getMonth() - (5 - i));
        const monthOrders = orders.filter(o => {
          const d = new Date(o.createdAt);
          return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
        });
        return {
          name: monthDate.toLocaleString('en-US', { month: 'short' }),
          sales: monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          orders: monthOrders.length
        };
      });
    } else if (range === '1y') {
      data = Array.from({ length: 12 }, (_, i) => {
        const monthDate = new Date(now);
        monthDate.setMonth(now.getMonth() - (11 - i));
        const monthOrders = orders.filter(o => {
          const d = new Date(o.createdAt);
          return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
        });
        return {
          name: monthDate.toLocaleString('en-US', { month: 'short' }),
          sales: monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          orders: monthOrders.length
        };
      });
    }
    setSalesData(data);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || '',
        stock: editingProduct.stock || '',
        categoryId: editingProduct.category?.id || ''
      });
      setImagePreview(editingProduct.image?.url || null);
      setImageFile(null);
    } else {
      setFormData({ name: '', description: '', price: '', stock: '', categoryId: '' });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingProduct]);

  useEffect(() => {
    if (editingOrder) {
      setOrderStatus(editingOrder.status || 'pending');
    }
  }, [editingOrder]);
useEffect(() => {
  const adminUser = localStorage.getItem('adminUser');
  if (!adminUser) {
    window.location.href = '/admin'; // Redirect to login
  }

  // Prevent navigation to dashboard after logout
  window.history.pushState(null, "", window.location.href);
  window.onpopstate = () => {
    window.history.go(1);
  };
}, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const productsRes = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { products { id name price stock description image { url } category { id name } } categories { id name } }`
        })
      });
      const productsData = await productsRes.json();
      setProducts(productsData.data?.products || []);
      setCategories(productsData.data?.categories || []);

      const ordersRes = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { orders { id orderNumber totalAmount status createdAt user { id name email } items { id quantity price product { id name image { url } } } shippingAddress { id fullName phone address city state postalCode country } } }`
        })
      });
      const ordersData = await ordersRes.json();
      const fetchedOrders = ordersData.data?.orders || [];
      setOrders(fetchedOrders);

      setStats({
        totalProducts: productsData.data?.products.length || 0,
        totalOrders: fetchedOrders.length,
        totalRevenue: fetchedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        totalCustomers: new Set(fetchedOrders.map(o => o.user?.id).filter(Boolean)).size,
        pendingOrders: fetchedOrders.filter(o => o.status === 'pending').length,
        lowStockProducts: (productsData.data?.products || []).filter(p => p.stock < 10).length
      });

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });
      setSalesData(last7Days.map(day => {
        const dayOrders = fetchedOrders.filter(o => o.createdAt?.startsWith(day));
        return {
          name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
          sales: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
          orders: dayOrders.length
        };
      }));

      const categoryCount = {};
      (productsData.data?.products || []).forEach(p => {
        const catName = p.category?.name || 'Uncategorized';
        categoryCount[catName] = (categoryCount[catName] || 0) + 1;
      });
      setCategoryData(Object.entries(categoryCount).map(([name, value]) => ({ name, value })));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
  };

  const getFilteredProducts = () => {
  let filtered = products;
  
  // Apply search filter
  if (productSearch.trim()) {
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }
  
  // Apply low stock filter
  if (showLowStock) {
    filtered = filtered.filter(product => product.stock < 10);
  }
  
  return filtered;
};
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation DeleteProduct($id: ID!) { deleteProduct(where: { id: $id }) { id } }`,
          variables: { id: productId }
        })
      });
      const result = await response.json();
      if (!result.errors) {
        showNotification('Product deleted successfully!', 'success');
        fetchDashboardData();
      } else {
        showNotification('Failed to delete product', 'error');
      }
    } catch (error) {
      showNotification('Failed to delete product', 'error');
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const mutation = editingProduct
        ? `mutation UpdateProduct($id: ID!, $data: ProductUpdateInput!) { updateProduct(where: { id: $id }, data: $data) { id name image { url } } }`
        : `mutation CreateProduct($data: ProductCreateInput!) { createProduct(data: $data) { id name image { url } } }`;

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        ...(formData.categoryId && { category: { connect: { id: formData.categoryId } } })
      };

      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mutation,
          variables: editingProduct ? { id: editingProduct.id, data: productData } : { data: productData }
        })
      });

      const result = await response.json();
      if (!result.errors) {
        const productId = editingProduct?.id || result.data.createProduct.id;
        if (imageFile && productId) {
          try {
            await uploadProductImage(productId, imageFile);
          } catch (uploadError) {
            showNotification(editingProduct ? 'Product updated but image upload failed.' : 'Product created but image upload failed.', 'error');
            fetchDashboardData();
            setShowAddProduct(false);
            setEditingProduct(null);
            return;
          }
        }
        showNotification(editingProduct ? 'Product updated successfully!' : 'Product created successfully!', 'success');
        fetchDashboardData();
        setShowAddProduct(false);
        setEditingProduct(null);
      } else {
        showNotification('Error: ' + result.errors[0].message, 'error');
      }
    } catch (error) {
      showNotification('Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProductImage = async (productId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${REST_API_URL}/api/products/${productId}/upload-image`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  };

  const handleUpdateOrderStatus = async () => {
    if (!editingOrder) return;
    setSubmitting(true);
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation UpdateOrderStatus($id: ID!, $status: String!) { updateOrder(where: { id: $id }, data: { status: $status }) { id status } }`,
          variables: { id: editingOrder.id, status: orderStatus }
        })
      });
      const result = await response.json();
      if (!result.errors) {
        showNotification('Order status updated successfully!', 'success');
        fetchDashboardData();
        setEditingOrder(null);
      } else {
        showNotification('Error: ' + result.errors[0].message, 'error');
      }
    } catch (error) {
      showNotification('Failed to update order status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-700';
  };

  const Notification = ({ message, type, onClose }) => (
    <div className="fixed top-4 right-4 z-[60] max-w-sm">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-2 ${type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
        {type === 'success' ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
        <p className="font-medium text-sm">{message}</p>
        <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );

  const ImageModal = ({ imageUrl, altText, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-full max-h-full">
        <button onClick={onClose} className="absolute top-2 right-2 md:-top-12 md:right-0 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors z-10">
          <X className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
        </button>
        <img src={imageUrl} alt={altText} className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-2 md:p-3 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{loading ? '...' : value}</div>
      <div className="text-xs md:text-sm text-gray-600">{title}</div>
    </div>
  );

  const ProductModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmitProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-40 md:h-48 object-cover rounded-lg border-2 border-gray-300" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 md:px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />Image ready
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 md:h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 group">
                <div className="p-2 md:p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200"><Upload className="h-6 w-6 md:h-8 md:w-8 text-blue-600" /></div>
                <p className="mb-2 text-xs md:text-sm text-gray-700"><span className="font-semibold">Click to upload</span></p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) <span className="text-red-500">*</span></label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
              <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" required min="0" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</> : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const OrderDetailsModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 rounded-t-xl flex justify-between items-center">
          <h3 className="text-xl md:text-2xl font-bold">Order Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5 md:h-6 md:w-6" /></button>
        </div>
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div><div className="text-xs md:text-sm text-gray-600 mb-1">Order Number</div><div className="font-bold text-sm md:text-lg">{order.orderNumber}</div></div>
              <div><div className="text-xs md:text-sm text-gray-600 mb-1">Total Amount</div><div className="font-bold text-sm md:text-lg text-green-600">{formatCurrency(order.totalAmount)}</div></div>
              <div><div className="text-xs md:text-sm text-gray-600 mb-1">Status</div><span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(order.status)}`}>{ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}</span></div>
              <div><div className="text-xs md:text-sm text-gray-600 mb-1">Order Date</div><div className="font-semibold text-sm md:text-base">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</div></div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4"><User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" /><h4 className="text-base md:text-lg font-semibold">Customer Information</h4></div>
            <div className="grid md:grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-start gap-3"><User className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mt-1" /><div><div className="text-xs md:text-sm text-gray-600">Name</div><div className="font-medium text-sm md:text-base">{order.user?.name || 'Guest User'}</div></div></div>
              <div className="flex items-start gap-3"><Mail className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mt-1" /><div><div className="text-xs md:text-sm text-gray-600">Email</div><div className="font-medium text-sm md:text-base break-all">{order.user?.email || 'N/A'}</div></div></div>
            </div>
          </div>
          {order.shippingAddress && (
            <div className="bg-white border rounded-lg p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4"><MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-600" /><h4 className="text-base md:text-lg font-semibold">Shipping Address</h4></div>
              <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-start gap-3"><User className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mt-1" /><div><div className="text-xs md:text-sm text-gray-600">Full Name</div><div className="font-medium text-sm md:text-base">{order.shippingAddress.fullName}</div></div></div>
                <div className="flex items-start gap-3"><Phone className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mt-1" /><div><div className="text-xs md:text-sm text-gray-600">Phone Number</div><div className="font-medium text-sm md:text-base">{order.shippingAddress.phone}</div></div></div>
                <div className="md:col-span-2 flex items-start gap-3"><MapPin className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mt-1" /><div className="flex-1"><div className="text-xs md:text-sm text-gray-600 mb-1">Address</div><div className="font-medium text-sm md:text-base leading-relaxed">{order.shippingAddress.address}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />{order.shippingAddress.country}</div></div></div>
              </div>
            </div>
          )}
          <div className="bg-white border rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4"><Package className="h-4 w-4 md:h-5 md:w-5 text-blue-600" /><h4 className="text-base md:text-lg font-semibold">Order Items</h4></div>
            <div className="space-y-3 md:space-y-4">
              {order.items && order.items.length > 0 ? order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); setImageModal({ url: item.product?.image?.url || 'https://via.placeholder.com/80', alt: item.product?.name || 'Product' }); }}>
                    <img src={item.product?.image?.url || 'https://via.placeholder.com/80'} alt={item.product?.name || 'Product'} className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-lg border transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all flex items-center justify-center"><ZoomIn className="h-5 w-5 md:h-6 md:w-6 text-white opacity-0 group-hover:opacity-100" /></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-sm md:text-base text-gray-900 truncate">{item.product?.name || 'Unknown Product'}</h5>
                    <div className="text-xs md:text-sm text-gray-600 mt-1">Quantity: <span className="font-medium">{item.quantity}</span></div>
                    <div className="text-xs md:text-sm text-gray-600">Price: <span className="font-medium">{formatCurrency(item.price)}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs md:text-sm text-gray-600">Subtotal</div>
                    <div className="font-bold text-sm md:text-lg">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                </div>
              )) : <div className="text-center py-8 text-gray-500 text-sm">No items in this order</div>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button onClick={() => { setEditingOrder(order); onClose(); }} className="flex-1 px-4 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm md:text-base">Update Order Status</button>
            <button onClick={onClose} className="px-6 py-2 md:py-3 border rounded-lg hover:bg-gray-50 font-medium text-sm md:text-base">Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  const OrderStatusModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold">Update Order Status</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg text-sm md:text-base">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Order Number</div>
            <div className="font-semibold">{order.orderNumber}</div>
            <div className="text-xs md:text-sm text-gray-600 mt-2">Customer</div>
            <div className="font-medium">{order.user?.name || 'Guest'}</div>
            <div className="text-xs md:text-sm text-gray-600 mt-2">Amount</div>
            <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
            <div className="space-y-2">
              {ORDER_STATUSES.map(status => (
                <label key={status.value} className={`flex items-center p-2 md:p-3 border-2 rounded-lg cursor-pointer transition-all ${orderStatus === status.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="orderStatus" value={status.value} checked={orderStatus === status.value} onChange={(e) => setOrderStatus(e.target.value)} className="mr-3" />
                  <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${status.color}`}>{status.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleUpdateOrderStatus} disabled={submitting} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Updating...' : 'Update Status'}</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Dashboard</button>
              <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Products</button>
              <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Orders</button>
              
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              
              <button onClick={handleMainWebsite} className="px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Main Website</span>
              </button>
              <button onClick={handleSignOut} className="px-4 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 flex flex-col gap-2 pb-2">
              <button onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }} className={`px-4 py-2 rounded-lg text-left ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Dashboard</button>
              <button onClick={() => { setActiveTab('products'); setShowMobileMenu(false); }} className={`px-4 py-2 rounded-lg text-left ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Products</button>
              <button onClick={() => { setActiveTab('orders'); setShowMobileMenu(false); }} className={`px-4 py-2 rounded-lg text-left ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Orders</button>
              
              <div className="h-px bg-gray-300 my-1"></div>
              
              <button onClick={() => { handleMainWebsite(); setShowMobileMenu(false); }} className="px-4 py-2 rounded-lg text-left bg-gray-100 text-gray-600 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Main Website</span>
              </button>
              <button onClick={() => { handleSignOut(); setShowMobileMenu(false); }} className="px-4 py-2 rounded-lg text-left bg-red-50 text-red-600 flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                  <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-green-500" />
                  <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="bg-blue-500" />
                  <StatCard title="Products" value={stats.totalProducts} icon={Package} color="bg-purple-500" />
                  <StatCard title="Customers" value={stats.totalCustomers} icon={Users} color="bg-orange-500" />
                </div>

                {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {stats.pendingOrders > 0 && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 md:p-6 rounded-lg">
                        <div className="flex items-center gap-3 md:gap-4">
                          <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">Pending Orders</h3>
                            <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {stats.lowStockProducts > 0 && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 md:p-6 rounded-lg">
                        <div className="flex items-center gap-3 md:gap-4">
                          <Package className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                          <div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">Low Stock Alert</h3>
                            <p className="text-xl md:text-2xl font-bold text-red-600">{stats.lowStockProducts} items</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base md:text-lg font-semibold">Sales Overview</h3>
                      <select className="border rounded-lg text-xs md:text-sm px-2 md:px-3 py-1" value={selectedRange} onChange={(e) => handleRangeChange(e.target.value)}>
                        <option value="7d">Last 7 Days</option>
                        <option value="4w">Last 4 Weeks</option>
                        <option value="6m">Last 6 Months</option>
                        <option value="1y">Last 1 Year</option>
                      </select>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold mb-4">Products by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={80} fill="#8884d8" dataKey="value">
                          {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-semibold mb-4">Recent Orders</h3>
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Order #</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Customer</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Amount</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Date</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">{order.orderNumber}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">{order.user?.name || 'Guest'}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3"><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}</span></td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3">
                              <button onClick={() => setViewingOrder(order)} className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium flex items-center gap-1">
                                <Eye className="h-3 w-3 md:h-4 md:w-4" />View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          {activeTab === 'products' && (
  <div className="space-y-4 md:space-y-6">
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h2 className="text-xl md:text-2xl font-bold">Products</h2>
      <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 text-sm md:text-base w-fit">
        <Plus className="h-4 w-4" />Add Product
      </button>
    </div>
    
    {/* Search and Filter Bar */}
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium whitespace-nowrap ${
            showLowStock 
              ? 'bg-red-50 border-red-300 text-red-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Low Stock {showLowStock ? 'Only' : ''}
        </button>
      </div>
      
      {/* Active Filters Display */}
      {(productSearch || showLowStock) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
          <span className="text-xs text-gray-600 font-medium">Active filters:</span>
          {productSearch && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              Search: "{productSearch}"
              <button onClick={() => setProductSearch('')} className="hover:bg-blue-200 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {showLowStock && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
              Low Stock
              <button onClick={() => setShowLowStock(false)} className="hover:bg-red-200 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setProductSearch('');
              setShowLowStock(false);
            }}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
    
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Image</th>
              <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Name</th>
              <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Category</th>
              <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Price</th>
              <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Stock</th>
              <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {getFilteredProducts().length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No products found</p>
                  {(productSearch || showLowStock) && (
                    <button
                      onClick={() => {
                        setProductSearch('');
                        setShowLowStock(false);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              getFilteredProducts().map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <img src={product.image?.url || 'https://via.placeholder.com/50'} alt={product.name} className="h-10 w-10 md:h-12 md:w-12 object-cover rounded" />
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium">{product.name}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">{product.category?.name || 'N/A'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium">{formatCurrency(product.price)}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{product.stock}</span>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:text-blue-800"><Edit className="h-3 w-3 md:h-4 md:w-4" /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-3 w-3 md:h-4 md:w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    
    {/* Results Counter */}
    {getFilteredProducts().length > 0 && (
      <div className="text-sm text-gray-600 text-center">
        Showing {getFilteredProducts().length} of {products.length} products
      </div>
    )}
  </div>
)}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4">All Orders</h2>
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Order #</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Customer</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Email</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Amount</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Status</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Date</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium">{order.orderNumber}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">{order.user?.name || 'Guest'}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600">{order.user?.email || 'N/A'}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3"><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}</span></td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <div className="flex gap-2">
                              <button onClick={() => setViewingOrder(order)} className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium flex items-center gap-1">
                                <Eye className="h-3 w-3 md:h-4 md:w-4" />View
                              </button>
                              <button onClick={() => setEditingOrder(order)} className="text-green-600 hover:text-green-800 text-xs md:text-sm font-medium">Update</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showAddProduct && <ProductModal onClose={() => setShowAddProduct(false)} />}
      {editingProduct && <ProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
      {viewingOrder && <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
      {editingOrder && <OrderStatusModal order={editingOrder} onClose={() => setEditingOrder(null)} />}
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      {imageModal && <ImageModal imageUrl={imageModal.url} altText={imageModal.alt} onClose={() => setImageModal(null)} />}
    </div>
  );
};

export default AdminDashboard;