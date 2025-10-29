// src/services/orderService.js
import { API_URL } from '../services/api';

// GraphQL mutations and queries matching the new schema
const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($data: OrderCreateInput!) {
    createOrder(data: $data) {
      id
      orderNumber
      totalAmount
      status
      createdAt
      user {
        id
        name
        email
      }
      items {
        id
        quantity
        price
        product {
          id
          name
          price
        }
      }
      shippingAddress {
        id
        fullName
        phone
        address
        city
        state
        postalCode
        country
      }
    }
  }
`;

const GET_USER_ORDERS_QUERY = `
  query GetUserOrders($userId: ID!) {
    orders(where: { user: { id: { equals: $userId } } }, orderBy: { createdAt: desc }) {
      id
      orderNumber
      totalAmount
      status
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
          price
        }
      }
      shippingAddress {
        id
        fullName
        phone
        address
        city
        state
        postalCode
        country
      }
    }
  }
`;

const GET_ORDER_BY_ID_QUERY = `
  query GetOrderById($id: ID!) {
    order(where: { id: $id }) {
      id
      orderNumber
      totalAmount
      status
      createdAt
      user {
        id
        name
        email
      }
      items {
        id
        quantity
        price
        product {
          id
          name
          price
        }
      }
      shippingAddress {
        id
        fullName
        phone
        address
        city
        state
        postalCode
        country
      }
    }
  }
`;

class OrderService {
  // Create a new order
  static async createOrder(orderData) {
    try {
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CREATE_ORDER_MUTATION,
          variables: {
            data: orderData,
          },
        }),
      });

      const result = await response.json();
      console.log('GraphQL response:', JSON.stringify(result, null, 2));
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        result.errors.forEach((error, index) => {
          console.error(`Error ${index + 1}:`, error.message);
          if (error.locations) {
            console.error('Locations:', error.locations);
          }
          if (error.path) {
            console.error('Path:', error.path);
          }
        });
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to create order',
        };
      }

      return {
        success: true,
        data: result.data.createOrder,
        message: 'Order created successfully',
      };
    } catch (error) {
      console.error('Create order error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create order',
      };
    }
  }

  // Get user orders
  static async getUserOrders({ userId }) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_USER_ORDERS_QUERY,
          variables: {
            userId,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to fetch orders',
        };
      }

      return {
        success: true,
        data: {
          orders: result.data.orders,
          total: result.data.orders?.length || 0,
        },
        message: 'Orders fetched successfully',
      };
    } catch (error) {
      console.error('Get orders error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch orders',
      };
    }
  }

  // Get order by ID
  static async getOrderById(orderId) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_ORDER_BY_ID_QUERY,
          variables: {
            id: orderId,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to fetch order',
        };
      }

      return {
        success: true,
        data: result.data.order,
        message: 'Order fetched successfully',
      };
    } catch (error) {
      console.error('Get order error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch order',
      };
    }
  }
}

export default OrderService;