// Paystack Payment Service
const REST_API_URL = import.meta.env.VITE_REST_API_URL || 'http://localhost:4000';

export const paystackService = {
  getPublicKey: () => {
    return import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  },

  initializePayment: async (orderData) => {
    try {
      // ✅ Correct REST endpoint
      const response = await fetch(`${REST_API_URL}/api/payment/paystack/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: orderData.email,
          amount: orderData.amount * 100, // Paystack uses kobo
          orderId: orderData.orderId,
          metadata: {
            orderNumber: orderData.orderNumber,
            userId: orderData.userId,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Paystack init error:', errorData);
        throw new Error(errorData.message || 'Failed to initialize payment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  },

  verifyPayment: async (reference) => {
    try {
      console.log('🔍 Verifying at:', `${REST_API_URL}/api/payment/paystack/verify/${reference}`);
      
      // ✅ Correct REST endpoint (not GraphQL!)
      const response = await fetch(`${REST_API_URL}/api/payment/paystack/verify/${reference}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Verification failed:', errorData);
        throw new Error(errorData.message || 'Failed to verify payment');
      }

      const data = await response.json();
      console.log('✅ Verification successful:', data);
      return data;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  },
};