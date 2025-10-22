// Stripe Payment Service
export const stripeService = {
  getPublicKey: () => {
    return import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
  },

  createPaymentIntent: async (orderData) => {
    try {
      console.log('📤 Sending payment intent request:', orderData);
      
      const response = await fetch('http://localhost:4000/api/payment/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: orderData.amount,
          orderId: orderData.orderId,
          metadata: {
            orderNumber: orderData.orderNumber,
            userId: orderData.userId,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Stripe API error:', errorText);
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      console.log('✅ Payment intent response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Stripe payment intent error:', error);
      throw error;
    }
  },

  confirmPayment: async (paymentIntentId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/payment/stripe/confirm/${paymentIntentId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Stripe confirmation error:', error);
      throw error;
    }
  },
};