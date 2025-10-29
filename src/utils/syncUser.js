// syncUser.js - With Render sleep handling
import { API_URL } from '../services/api';
import checkBackendHealth from '../utils/backendHealthCheck';

const CHECK_USER_BY_CLERK_ID = `
  query CheckUserByClerkId($clerkId: String!) {
    users(where: { clerkId: { equals: $clerkId } }) {
      id
      clerkId
      email
      name
    }
  }
`;

const CHECK_USER_BY_EMAIL = `
  query CheckUserByEmail($email: String!) {
    users(where: { email: { equals: $email } }) {
      id
      clerkId
      email
      name
    }
  }
`;

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $data: UserUpdateInput!) {
    updateUser(where: { id: $id }, data: $data) {
      id
      clerkId
      email
      name
    }
  }
`;

const CREATE_USER_MUTATION = `
  mutation CreateUser($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      clerkId
      email
      name
    }
  }
`;

async function makeGraphQLRequest(query, variables, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`GraphQL request attempt ${attempt}/${retries}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      const contentType = response.headers.get('content-type');
      
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error(`Attempt ${attempt}: Non-JSON response:`, text.substring(0, 200));
        
        // If we get HTML, backend might be sleeping
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          if (attempt < retries) {
            console.log('Backend may be sleeping, retrying in 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
          throw new Error('Backend is returning HTML instead of JSON. The service may be starting up. Please try again in a moment.');
        }
        
        throw new Error(`Server returned non-JSON response (${response.status})`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(result.errors[0]?.message || 'GraphQL request failed');
      }

      return result;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function syncUser(userData) {
  try {
    console.log('Starting user sync...');
    console.log('User data to sync:', userData);

    // Validate input
    if (!userData || !userData.clerkId || !userData.email) {
      throw new Error('Invalid user data: clerkId and email are required');
    }

    // Check if API_URL is configured
    if (!API_URL || API_URL === 'undefined' || API_URL === '') {
      throw new Error('API_URL is not configured. Please check your environment variables.');
    }

    // Ensure backend is awake
    const health = await checkBackendHealth(false);
    if (!health.ready) {
      throw new Error('Backend is not available. Please refresh the page and try again.');
    }
    
    // 1. Check if user exists by clerkId
    const clerkIdResult = await makeGraphQLRequest(CHECK_USER_BY_CLERK_ID, {
      clerkId: userData.clerkId
    });

    // 2. If user exists by clerkId, return them
    if (clerkIdResult.data?.users?.length > 0) {
      console.log('User found by clerkId:', clerkIdResult.data.users[0]);
      return clerkIdResult.data.users[0];
    }

    // 3. Check if user exists by email
    const emailResult = await makeGraphQLRequest(CHECK_USER_BY_EMAIL, {
      email: userData.email
    });

    // 4. If user exists by email, update with clerkId
    if (emailResult.data?.users?.length > 0) {
      const existingUser = emailResult.data.users[0];
      console.log('User found by email, updating with clerkId...');
      
      const updateResult = await makeGraphQLRequest(UPDATE_USER_MUTATION, {
        id: existingUser.id,
        data: {
          clerkId: userData.clerkId,
          name: userData.name || existingUser.name,
        },
      });

      console.log('User updated successfully:', updateResult.data.updateUser);
      return updateResult.data.updateUser;
    }

    // 5. User doesn't exist, create new user
    console.log('User not found, creating new user...');
    
    const createResult = await makeGraphQLRequest(CREATE_USER_MUTATION, {
      data: {
        clerkId: userData.clerkId,
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        password: 'clerk-managed',
        isAdmin: false,
      },
    });

    console.log('User created successfully:', createResult.data.createUser);
    return createResult.data.createUser;
    
  } catch (error) {
    console.error('Error syncing user:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      API_URL: API_URL,
    });
    throw error;
  }
}

export default syncUser;