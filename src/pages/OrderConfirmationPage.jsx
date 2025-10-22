import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, Phone, CreditCard } from 'lucide-react';
import orderService from '../services/orderService';
import { InlineLoading } from '../components/common/Loading';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await orderService.getOrderById(orderId);
        if (result.success) {
          setOrder(result.data);
        } else {
          console.error('Failed to fetch order:', result.message);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <InlineLoading size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                  <p className="text-gray-600">Order #{order.orderNumber}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-gray-600" />
                    Shipping Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start mb-3">
                      <MapPin className="h-5 w-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                        <p className="text-gray-600">{order.shippingAddress.address}</p>
                        <p className="text-gray-600">
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        </p>
                        <p className="text-gray-600">{order.shippingAddress.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center mt-3">
                      <Phone className="h-5 w-5 text-gray-600 mr-2" />
                      <p className="text-gray-600">{order.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>
                
                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ₦{(order.totalAmount - (order.totalAmount * 0.075) - 2500).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">₦2,500</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax (7.5%)</span>
                      <span className="font-medium">₦{(order.totalAmount * 0.075).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-primary-700">₦{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-gray-600" />
                  Order Items
                </h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center">
                      <img
                        src={item.product.image?.url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=100&q=80'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg mr-4"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium text-gray-900">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-white text-primary-600 font-medium rounded-lg border border-primary-600 hover:bg-primary-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;