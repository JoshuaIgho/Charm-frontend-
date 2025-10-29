import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import {
  MapPin,
  CreditCard,
  Shield,
  ArrowLeft,
  Loader,
  ChevronDown,
  Check,
} from "lucide-react";
import { PaystackButton } from "react-paystack";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import orderService from "../services/orderService";
import AddressService from "../services/addressService";
import { paystackService } from "../services/payment/paystackService";
import { stripeService } from "../services/payment/stripeService";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/graphql';


// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { userId } = useAuth();
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useClerkAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressList, setShowAddressList] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [errors, setErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [stripeClientSecret, setStripeClientSecret] = useState("");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50000 ? 0 : 2500;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;

  // Load saved addresses
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!userId) return;

      const response = await AddressService.getUserAddresses(userId);
      if (response.success) {
        setSavedAddresses(response.data);

        // Auto-select default address
        const defaultAddr = response.data.find((addr) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setDeliveryInfo({
            fullName: defaultAddr.fullName,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            city: defaultAddr.city,
            state: defaultAddr.state,
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country,
          });
        }
      }
    };

    loadSavedAddresses();
  }, [userId]);

  // Load user data from Clerk
  useEffect(() => {
    if (isLoaded && user && !selectedAddressId) {
      setDeliveryInfo((prev) => ({
        ...prev,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        phone: user.phoneNumbers?.[0]?.phoneNumber || "",
      }));
    }
  }, [isLoaded, user, selectedAddressId]);

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddressId(address.id);
    setDeliveryInfo({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setShowAddressList(false);
    toast.success("Address loaded");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!deliveryInfo.fullName.trim())
      newErrors.fullName = "Full name is required";
    if (!deliveryInfo.phone.trim())
      newErrors.phone = "Phone number is required";
    if (!deliveryInfo.address.trim()) newErrors.address = "Address is required";
    if (!deliveryInfo.city.trim()) newErrors.city = "City is required";
    if (!deliveryInfo.state.trim()) newErrors.state = "State is required";
    if (!deliveryInfo.postalCode.trim())
      newErrors.postalCode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (!isSignedIn || !userId) {
      toast.error("Please sign in to continue");
      navigate("/sign-in");
      return;
    }

    setIsProcessing(true);

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()}`;

      const orderData = {
        orderNumber,
        totalAmount: Math.round(total),
        status: "pending",
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
        user: { connect: { id: userId } },
        items: {
          create: cartItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            product: { connect: { id: item.id } },
          })),
        },
        shippingAddress: {
          create: {
            fullName: deliveryInfo.fullName,
            phone: deliveryInfo.phone,
            address: deliveryInfo.address,
            city: deliveryInfo.city,
            state: deliveryInfo.state,
            postalCode: deliveryInfo.postalCode,
            country: deliveryInfo.country,
          },
        },
      };

      const result = await orderService.createOrder(orderData);

      if (result.success) {
        setCurrentOrder(result.data);

        // Handle different payment methods
        if (paymentMethod === "cod") {
          // Cash on Delivery - Direct confirmation
          clearCart();
          toast.success("Order placed successfully! Pay on delivery.");
          navigate(`/order-confirmation/${result.data.id}`);
        } else if (paymentMethod === "stripe") {
          // Stripe - Create payment intent
          const stripeIntent = await stripeService.createPaymentIntent({
            amount: Math.round(total),
            orderId: result.data.id,
            orderNumber: orderNumber,
            userId: userId,
          });

          if (stripeIntent.success) {
            setStripeClientSecret(stripeIntent.clientSecret);
            setShowPaymentModal(true);
            setIsProcessing(false);
          } else {
            throw new Error("Failed to initialize Stripe payment");
          }
        } else if (paymentMethod === "paystack") {
          // Paystack - Show payment modal
          setShowPaymentModal(true);
          setIsProcessing(false);
        }
      } else {
        toast.error(result.message || "Failed to place order");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to place order");
      setIsProcessing(false);
    }
  };

  // Paystack success handler
  // Add this to your CheckoutPage.jsx - Replace the existing handlePaystackSuccess function

  const handlePaystackSuccess = async (reference) => {
  console.log('\n🎉 ========================================');
  console.log('🎉 PAYSTACK SUCCESS CALLBACK');
  console.log('🎉 ========================================');
  console.log('📋 Reference Object:', reference);
  console.log('📋 Reference String:', reference.reference);
  console.log('📋 Current Order:', currentOrder);

  try {
    // Step 1: Verify payment with backend
    console.log('🔍 Step 1: Verifying payment...');
    const verification = await paystackService.verifyPayment(reference.reference);
    console.log('✅ Verification Response:', verification);

    if (!verification.success) {
      throw new Error(verification.message || 'Payment verification failed');
    }

    console.log('💰 Payment Amount:', verification.data.amount);
    console.log('📧 Customer Email:', verification.data.customer.email);
    console.log('✅ Payment Status:', verification.data.status);

    // Step 2: Update order status in database
    console.log('📝 Step 2: Updating order in database...');

   const updateResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation UpdateOrder($id: ID!, $data: OrderUpdateInput!) {
            updateOrder(where: { id: $id }, data: $data) { 
              id 
              orderNumber
              paymentStatus
              status
              paymentReference
            }
          }
        `,
        variables: {
          id: currentOrder.id,
          data: {
            paymentStatus: 'paid',
            status: 'confirmed',
            paymentReference: reference.reference,
          },
              },
            }),
          }
        );

       const updateResult = await updateResponse.json();
    console.log('✅ Order Update Response:', updateResult);

    if (updateResult.errors) {
      console.error('❌ GraphQL Errors:', updateResult.errors);
      throw new Error(updateResult.errors[0].message);
    }

    // Step 3: Clear cart BEFORE navigation
    console.log('🧹 Step 3: Clearing cart...');
    clearCart();
    localStorage.removeItem('cart');
    sessionStorage.removeItem('cart');
    console.log('✅ Cart cleared successfully');

    // Step 4: Show success message
    console.log('🎊 Step 4: Payment complete! Redirecting...');
    toast.success('Payment successful! 🎉');
    
    // Step 5: Navigate to confirmation page
    navigate(`/order-confirmation/${currentOrder.id}`);
    
  } catch (error) {
    console.error('💥 ERROR IN PAYSTACK SUCCESS HANDLER');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    toast.error('Payment verification failed: ' + error.message);
    setIsProcessing(false);
  }

  console.log('🎉 ========================================\n');
};

  // Paystack close handler
  const handlePaystackClose = () => {
    toast.warning("Payment cancelled");
    setShowPaymentModal(false);
    setIsProcessing(false);
  };

  // Stripe payment handler (will be used in StripePaymentForm component)
  const handleStripeSuccess = async () => {
    clearCart();
    toast.success("Payment successful!");
    navigate(`/order-confirmation/${currentOrder.id}`);
  };
  if (!isLoaded) {  
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
// Stripe Payment Form Component
const StripePaymentForm = ({ clientSecret, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (!stripe || !elements || processing) {
      console.log('⚠️ Stripe not ready or already processing');
      return;
    }

    console.log('💳 Starting Stripe payment...');
    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('🔐 Confirming card payment...');
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: deliveryInfo.fullName,
              email: user?.primaryEmailAddress?.emailAddress,
              phone: deliveryInfo.phone,
              address: {
                line1: deliveryInfo.address,
                city: deliveryInfo.city,
                state: deliveryInfo.state,
                postal_code: deliveryInfo.postalCode,
                country: 'NG',
              },
            },
          },
        }
      );

      if (stripeError) {
        console.error('❌ Stripe error:', stripeError);
        setError(stripeError.message);
        toast.error(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded!');
        
        // Update order in database
        const updateResponse =  await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `mutation UpdateOrder($id: ID!, $data: OrderUpdateInput!) {
              updateOrder(where: { id: $id }, data: $data) { 
                id 
                orderNumber
                paymentStatus
                status
              }
            }`,
            variables: {
              id: currentOrder.id,
              data: {
                paymentStatus: 'paid',
                status: 'confirmed',
                paymentReference: paymentIntent.id,
              },
            },
          }),
        });

        const updateResult = await updateResponse.json();
        
        if (updateResult.errors) {
          console.error('❌ GraphQL errors:', updateResult.errors);
          throw new Error(updateResult.errors[0].message);
        }

        console.log('✅ Order updated successfully');
        onSuccess();
      } else {
        console.log('⚠️ Payment status:', paymentIntent.status);
        throw new Error(`Payment ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err.message);
      toast.error('Payment failed: ' + err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || processing}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </span>
              ) : (
                `Pay ₦${total.toLocaleString()}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  // Paystack configuration
  const paystackConfig = currentOrder
    ? {
        reference: new Date().getTime().toString(),
        email: user?.primaryEmailAddress?.emailAddress || "",
        amount: Math.round(total) * 100, // Paystack uses kobo
        publicKey: paystackService.getPublicKey(),
        metadata: {
          orderId: currentOrder.id,
          orderNumber: currentOrder.orderNumber,
          userId: userId,
        },
      }
    : {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="inline-flex items-center text-primary-600 hover:text-primary-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Delivery Information
                  </h2>
                </div>

                {/* Saved Addresses Dropdown */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setShowAddressList(!showAddressList)}
                      className="w-full flex items-center justify-between p-4 border-2 border-primary-500 bg-primary-50 rounded-lg text-left hover:bg-primary-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary-600" />
                        <span className="font-medium text-gray-900">
                          {selectedAddressId
                            ? `Using: ${
                                savedAddresses.find(
                                  (a) => a.id === selectedAddressId
                                )?.fullName
                              }`
                            : "Select a saved address"}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-primary-600 transition-transform ${
                          showAddressList ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showAddressList && (
                      <div className="mt-3 space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleAddressSelect(addr)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              selectedAddressId === addr.id
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {addr.fullName}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              {selectedAddressId === addr.id && (
                                <Check className="h-5 w-5 text-primary-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {addr.address}, {addr.city}, {addr.state}{" "}
                              {addr.postalCode}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {addr.phone}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={deliveryInfo.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={deliveryInfo.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="+234 800 000 0000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={deliveryInfo.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="123, Example Street"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={deliveryInfo.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Lagos"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={deliveryInfo.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Lagos State"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={deliveryInfo.postalCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.postalCode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="100001"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={deliveryInfo.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Paystack */}
                  <div
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "paystack"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => setPaymentMethod("paystack")}
                  >
                    <input
                      type="radio"
                      id="paystack"
                      name="paymentMethod"
                      value="paystack"
                      checked={paymentMethod === "paystack"}
                      onChange={() => setPaymentMethod("paystack")}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor="paystack"
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">
                            Paystack
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            (Card, Bank Transfer, USSD)
                          </span>
                        </div>
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Paystack_Logo.png"
                          alt="Paystack"
                          className="h-3"
                        />
                      </div>
                    </label>
                  </div>

                  {/* Stripe */}
                  <div
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "stripe"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => setPaymentMethod("stripe")}
                  >
                    <input
                      type="radio"
                      id="stripe"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === "stripe"}
                      onChange={() => setPaymentMethod("stripe")}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor="stripe"
                      className="ml-3 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">
                            Stripe
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            (International Cards)
                          </span>
                        </div>
                        <svg
                          className="h-4"
                          viewBox="0 0 60 25"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="#635BFF"
                            d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z"
                          />
                        </svg>
                      </div>
                    </label>
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="cod" className="ml-3 flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">
                            Cash on Delivery
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            (Pay when you receive)
                          </span>
                        </div>
                        <span className="text-green-600 text-lg font-semibold">
                          ₦
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {paymentMethod === "paystack" &&
                      "✓ Pay securely with Paystack - Card, Bank Transfer, or USSD"}
                    {paymentMethod === "stripe" &&
                      "✓ Pay securely with Stripe - International cards accepted"}
                    {paymentMethod === "cod" &&
                      "✓ Pay cash when your order is delivered to your doorstep"}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={
                        item.image?.url ||
                        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=100&q=80"
                      }
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium text-gray-900">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "FREE" : `₦${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (7.5%)</span>
                  <span className="font-medium">₦{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-primary-700">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      Secure Checkout
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your payment information is encrypted and secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Modals */}
      {showPaymentModal && paymentMethod === "paystack" && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-4">
              Complete Payment with Paystack
            </h3>
            <p className="text-gray-600 mb-6">
              Click the button below to proceed to secure payment
            </p>
            <div className="flex flex-col gap-3">
              <PaystackButton
                {...paystackConfig}
                text={`Pay ₦${total.toLocaleString()}`}
                onSuccess={handlePaystackSuccess}
                onClose={handlePaystackClose}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              />
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setIsProcessing(false);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && paymentMethod === "stripe" && stripeClientSecret && (
        <Elements stripe={stripePromise}>
          <StripePaymentForm
            clientSecret={stripeClientSecret}
            onSuccess={handleStripeSuccess}
            onClose={() => {
              setShowPaymentModal(false);
              setIsProcessing(false);
            }}
          />
        </Elements>
      )}
    </div>
  );
};

export default CheckoutPage;
