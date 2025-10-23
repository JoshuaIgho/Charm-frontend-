// Paystack Payment Service
export const paystackService = {
  getPublicKey: () => {
    return import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  },

  initializePayment: async (orderData) => {
    try {
      const response = await fetch('http://localhost:4000/api/payment/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: orderData.email,
          amount: orderData.amount * 100, // Paystack uses kobo (multiply by 100)
          orderId: orderData.orderId,
          metadata: {
            orderNumber: orderData.orderNumber,
            userId: orderData.userId,
          },
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  },

  verifyPayment: async (reference) => {
    try {
      const response = await fetch(`http://localhost:4000/api/payment/paystack/verify/${reference}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  },
};