// src/services/addressService.js
const API_URL = 'http://localhost:4000/api/graphql';

const GET_USER_ADDRESSES = `
  query GetUserAddresses($userId: ID!) {
    addresses(where: { user: { id: { equals: $userId } } }, orderBy: { createdAt: desc }) {
      id
      fullName
      phone
      address
      city
      state
      postalCode
      country
      isDefault
      createdAt
    }
  }
`;

const CREATE_ADDRESS = `
  mutation CreateAddress($data: AddressCreateInput!) {
    createAddress(data: $data) {
      id
      fullName
      phone
      address
      city
      state
      postalCode
      country
      isDefault
    }
  }
`;

const UPDATE_ADDRESS = `
  mutation UpdateAddress($id: ID!, $data: AddressUpdateInput!) {
    updateAddress(where: { id: $id }, data: $data) {
      id
      fullName
      phone
      address
      city
      state
      postalCode
      country
      isDefault
    }
  }
`;

const DELETE_ADDRESS = `
  mutation DeleteAddress($id: ID!) {
    deleteAddress(where: { id: $id }) {
      id
    }
  }
`;

class AddressService {
  static async getUserAddresses(userId) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_USER_ADDRESSES,
          variables: { userId },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to fetch addresses',
        };
      }

      return {
        success: true,
        data: result.data.addresses || [],
      };
    } catch (error) {
      console.error('Get addresses error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch addresses',
      };
    }
  }

  static async createAddress(userId, addressData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CREATE_ADDRESS,
          variables: {
            data: {
              user: { connect: { id: userId } },
              ...addressData,
            },
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to create address',
        };
      }

      return {
        success: true,
        data: result.data.createAddress,
        message: 'Address created successfully',
      };
    } catch (error) {
      console.error('Create address error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create address',
      };
    }
  }

  static async updateAddress(addressId, addressData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: UPDATE_ADDRESS,
          variables: {
            id: addressId,
            data: addressData,
          },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to update address',
        };
      }

      return {
        success: true,
        data: result.data.updateAddress,
        message: 'Address updated successfully',
      };
    } catch (error) {
      console.error('Update address error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update address',
      };
    }
  }

  static async deleteAddress(addressId) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: DELETE_ADDRESS,
          variables: { id: addressId },
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return {
          success: false,
          message: result.errors[0]?.message || 'Failed to delete address',
        };
      }

      return {
        success: true,
        message: 'Address deleted successfully',
      };
    } catch (error) {
      console.error('Delete address error:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete address',
      };
    }
  }

  static async setDefaultAddress(userId, addressId) {
    try {
      const getResponse = await this.getUserAddresses(userId);
      
      if (!getResponse.success) {
        return getResponse;
      }

      const addresses = getResponse.data;
      for (const addr of addresses) {
        if (addr.id !== addressId && addr.isDefault) {
          await this.updateAddress(addr.id, { isDefault: false });
        }
      }

      const updateResponse = await this.updateAddress(addressId, { isDefault: true });
      
      if (updateResponse.success) {
        return {
          success: true,
          message: 'Default address updated successfully',
        };
      }

      return updateResponse;
    } catch (error) {
      console.error('Set default address error:', error);
      return {
        success: false,
        message: error.message || 'Failed to set default address',
      };
    }
  }

  static async getDefaultAddress(userId) {
    try {
      const response = await this.getUserAddresses(userId);
      
      if (!response.success) {
        return response;
      }

      const defaultAddress = response.data.find(addr => addr.isDefault);
      
      return {
        success: true,
        data: defaultAddress || null,
      };
    } catch (error) {
      console.error('Get default address error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get default address',
      };
    }
  }
}

export default AddressService;