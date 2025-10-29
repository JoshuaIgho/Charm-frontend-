// src/services/wishlistService.js
import { API_URL } from '../services/api'; // ✅ Add this import

const GET_USER_WISHLIST = `
  query GetUserWishlist($userId: ID!) {
    wishlistItems(where: { user: { id: { equals: $userId } } }, orderBy: { addedAt: desc }) {
      id
      addedAt
      product {
        id
        name
        description
        price
        stock
        image {
          url
        }
        category {
          name
        }
      }
    }
  }
`;

const ADD_TO_WISHLIST = `
  mutation AddToWishlist($data: WishlistItemCreateInput!) {
    createWishlistItem(data: $data) {
      id
      addedAt
      product {
        id
        name
        price
      }
    }
  }
`;

const REMOVE_FROM_WISHLIST = `
  mutation RemoveFromWishlist($id: ID!) {
    deleteWishlistItem(where: { id: $id }) {
      id
    }
  }
`;

const CHECK_IN_WISHLIST = `
  query CheckInWishlist($userId: ID!, $productId: ID!) {
    wishlistItems(where: { 
      user: { id: { equals: $userId } }, 
      product: { id: { equals: $productId } }
    }) {
      id
    }
  }
`;

class WishlistService {
  static async getUserWishlist(userId) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_USER_WISHLIST,
          variables: { userId },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to fetch wishlist',
        };
      }

      return {
        success: true,
        data: result.data.wishlistItems || [],
      };
    } catch (error) {
      console.error('Get wishlist error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch wishlist',
      };
    }
  }

  static async addToWishlist(userId, productId) {
    try {
      // First check if already in wishlist
      const checkResponse = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CHECK_IN_WISHLIST,
          variables: { userId, productId },
        }),
      });

      const checkResult = await checkResponse.json();
      
      if (checkResult.data?.wishlistItems?.length > 0) {
        return {
          success: false,
          message: 'Item already in wishlist',
        };
      }

      // Add to wishlist
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ADD_TO_WISHLIST,
          variables: {
            data: {
              user: { connect: { id: userId } },
              product: { connect: { id: productId } },
            },
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to add to wishlist',
        };
      }

      return {
        success: true,
        data: result.data.createWishlistItem,
        message: 'Added to wishlist',
      };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return {
        success: false,
        message: error.message || 'Failed to add to wishlist',
      };
    }
  }

  static async removeFromWishlist(wishlistItemId) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: REMOVE_FROM_WISHLIST,
          variables: { id: wishlistItemId },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to remove from wishlist',
        };
      }

      return {
        success: true,
        message: 'Removed from wishlist',
      };
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return {
        success: false,
        message: error.message || 'Failed to remove from wishlist',
      };
    }
  }
}

export default WishlistService; 